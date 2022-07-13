import { IncomingMessage, ServerResponse, useBody } from "h3";
import {
	graphql,
	GraphQLSchema,
	lexicographicSortSchema,
	print,
	printSchema,
	stripIgnoredCharacters,
} from "graphql";
import { ServeContext } from "../../listeners/context/context";
import { BaseRoute } from "../../routes/route";
import { gql, sendError } from "../../routes/utilities";
import useSchema from "./schema/schema";
import { Methods } from "../../composables/decorators/methods";
import { Route } from "../../composables/decorators/route";
import { fetch } from "cross-undici-fetch";
import {
	GraphQLSubgraph,
	isGraphQLSubgraph,
} from "../../composables/load-config";
import { introspectSchema } from "@graphql-tools/wrap";
import { stitchSchemas } from "@graphql-tools/stitch";
import { SubschemaConfig } from "@graphql-tools/delegate";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
import { Consola } from "../..";

let schema: GraphQLSchema;

@Methods("post")
@Route("/api")
export default class API extends BaseRoute {
	// @ts-expect-error Only used by the decorator
	private protected = true;
	private subgraphs = [];

	constructor(config: Record<string, any>) {
		super();

		this.protected = !!config.routes.api.protect;

		if (config.routes.api.subgraphs) {
			if (Array.isArray(config.routes.api.subgraphs)) {
				const createRemoteExecuter =
					(location: string, headers: Record<string, any>) =>
					async ({ document, variables }: any) => {
						const query = print(document);

						const fetchResult = await fetch(location, {
							method: "POST",
							headers: {
								...headers,
								"Content-Type": "application/json",
								body: JSON.stringify({ query, variables }),
							},
						});

						return fetchResult.json();
					};

				this.subgraphs = config.routes.api.subgraphs
					.filter((subgraph: any) => isGraphQLSubgraph(subgraph))
					.map(async (subgraph: GraphQLSubgraph): Promise<SubschemaConfig> => {
						const remoteExecutor = createRemoteExecuter(
							subgraph.location,
							subgraph?.headers ?? Object.create(null),
						);

						return {
							schema: await introspectSchema(remoteExecutor),
							executor: remoteExecutor,
							transforms: subgraph?.transforms ?? [],
						};
					});
			}
		}
	}

	async use(
		request: IncomingMessage,
		response: ServerResponse,
		context: ServeContext,
	) {
		try {
			const body = await useBody(request);

			if (typeof body !== "object" || !body.query)
				return sendError(response, "Invalid request");

			if (!schema) {
				const localSchema = await useSchema(request, response, context);

				schema = localSchema;
				if (this.subgraphs.length > 0) {
					this.subgraphs = await Promise.all(this.subgraphs);

					schema = stitchSchemas({
						subschemas: [...this.subgraphs, { schema: localSchema }],
					});
				}

				// Implementation of schema reporting from
				// https://www.apollographql.com/docs/studio/schema/schema-reporting-protocol
				if (
					process.env.APOLLO_KEY &&
					process.env.APOLLO_GRAPH_REF &&
					process.env.APOLLO_SCHEMA_REPORTING
				) {
					// We need to do this twice because the final schema
					// can be composed of multiple other subschemas
					const normalizeSchema = (schema: GraphQLSchema) =>
						stripIgnoredCharacters(
							printSchema(lexicographicSortSchema(schema)),
						);

					const schemaReporting =
						"https://schema-reporting.api.apollographql.com/api/graphql";
					const variant = process.env?.APOLLO_GRAPH_VARIANT ?? "current";
					const graphRef = `${process.env.APOLLO_GRAPH_REF}@${variant}`;
					const bootID = uuid();

					const schemaString = normalizeSchema(schema);
					const schemaHash = crypto
						.createHash("sha256")
						.update(schemaString)
						.digest("hex");
					const report = {
						bootID,
						coreSchemaHash: schemaHash,
						graphRef,
					};
					let withSchema = false;

					const reportSchema = async (
						coreSchema: string | null,
						report: {
							bootID: string;
							coreSchemaHash: string;
							graphRef: string;
						},
					) => {
						const reportSchemaMutation = stripIgnoredCharacters(gql`
							mutation ReportSchemaMutation(
								$coreSchema: String
								$report: SchemaReport!
							) {
								reportSchema(coreSchema: $coreSchema, report: $report) {
									inSeconds
									withCoreSchema
									... on ReportSchemaError {
										code
										message
									}
								}
							}
						`);

						const result = await fetch(schemaReporting, {
							headers: new Headers({
								"X-API-Key": process.env.APOLLO_KEY as string,
							}),
							body: JSON.stringify({
								query: reportSchemaMutation,
								variables: {
									coreSchema,
									report,
								},
							}),
						});

						if (result.status >= 200 && result.status < 300)
							return await result.json();

						// If reportSchema fails with a non-2xx response
						// then retry after 20 seconds
						setTimeout(
							() => reportSchema(coreSchema, report),
							20 * Math.pow(10, 3),
						);
					};

					const sendReport = async () => {
						const coreSchema = withSchema ? schemaString : null;

						try {
							const response = await reportSchema(coreSchema, report);

							withSchema = response.withExecutableSchema;

							setTimeout(sendReport, response.inSeconds);
						} catch (error: any) {
							Consola.error("Unable to report schema to Apollo Studio");
						}
					};

					sendReport();
				}
			}

			const result = await graphql({
				schema,
				source: body.query,
				variableValues: body.variables,
			});

			response.statusCode = 200;
			response.setHeader("Content-Type", "application/json");

			return response.end(JSON.stringify(result));
		} catch (error: any) {
			return sendError(
				response,
				{ error: error.message, stack: error.stack },
				undefined,
				context,
				true,
			);
		}
	}
}
