import { useBody } from "h3";
import {
	graphql,
	GraphQLSchema,
	lexicographicSortSchema,
	print,
	printSchema,
	stripIgnoredCharacters,
} from "graphql";
import { SubschemaConfig } from "@graphql-tools/delegate";
import { introspectSchema } from "@graphql-tools/wrap";
import { stitchSchemas } from "@graphql-tools/stitch";
import { randomBytes, createHash } from "crypto";

import { useStore } from "../../utilities/store";
import { defineRoute } from "../route";
import { GraphQLSubgraph } from "../../composables/load-config";
import { Logger } from "../../adapters/logger/logger";
import { gql } from "../utilities";
import { useSchema } from "../api/use-schema-definition";

export default defineRoute({
	route: "/api",
	method: ["post"],
	middleware: [],
	protected: true,
	enabled: true,
	setup: async config => {
		let schema = useStore("schema");

		let subgraphs = [];
		if (config?.routes?.api?.subgraphs) {
			if (!Array.isArray(config.routes.api.subgraphs)) return;

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

			subgraphs = await Promise.all(
				config.routes.api.subgraphs.map(
					async (subgraph: GraphQLSubgraph): Promise<SubschemaConfig> => {
						const remoteExecutor = createRemoteExecuter(
							subgraph.location,
							subgraph?.headers ?? Object.create(null),
						);

						return {
							schema: await introspectSchema(remoteExecutor),
							executor: remoteExecutor,
							transforms: subgraph?.transforms ?? [],
						};
					},
				),
			);
		}

		const localSchema = useSchema();

		schema = stitchSchemas({
			subschemas: [...subgraphs, { schema: localSchema }],
		});

		registerSchema(schema);
	},
	use: async (request, response, useModule) => {
		const schema = useStore("schema");

		const body = await useBody(request);

		if (typeof body !== "object" || !body.query)
			throw new Error("Invalid request");

		const result = await graphql({
			schema,
			source: body.query,
			variableValues: body.variables,
			contextValue: { request, response, useModule },
		});

		response.statusCode = 200;
		response.setHeader("Content-Type", "application/json");

		return response.end(JSON.stringify(result));
	},
});

export const registerSchema = (schema: GraphQLSchema) => {
	// Implementation of schema reporting from
	// https://www.apollographql.com/docs/studio/schema/schema-reporting-protocol
	if (
		process.env.APOLLO_KEY &&
		process.env.APOLLO_GRAPH_REF &&
		process.env.APOLLO_SCHEMA_REPORTING
	) {
		const normalizeSchema = (schema: GraphQLSchema) =>
			stripIgnoredCharacters(printSchema(lexicographicSortSchema(schema)));

		const schemaReporting =
			"https://schema-reporting.api.apollographql.com/api/graphql";
		const variant = process.env?.APOLLO_GRAPH_VARIANT ?? "current";
		const graphRef = `${process.env.APOLLO_GRAPH_REF}@${variant}`;
		const bootID = randomBytes(16).toString("hex");

		const schemaString = normalizeSchema(schema);
		const schemaHash = createHash("sha256").update(schemaString).digest("hex");
		const report = {
			bootID,
			coreSchemaHash: schemaHash,
			graphRef,
		};

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
			setTimeout(() => reportSchema(coreSchema, report), 20 * Math.pow(10, 3));
		};

		const sendReport = async (withSchema = false) => {
			const coreSchema = withSchema ? schemaString : null;

			try {
				const response = await reportSchema(coreSchema, report);

				const withSchema = response.withExecutableSchema;

				setTimeout(
					() => sendReport.apply(null, [withSchema]),
					response.inSeconds,
				);
			} catch (error: any) {
				Logger.error("Unable to report schema to Apollo Studio");
			}
		};

		sendReport();
	}
};
