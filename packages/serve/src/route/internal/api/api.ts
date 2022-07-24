import type { Transform } from "@graphql-tools/delegate";
import type { SubschemaConfig } from "@graphql-tools/delegate";
import type { GraphQLSchema } from "graphql";
import type { IncomingMessage, ServerResponse } from "h3";
import { useBody, useCookies } from "h3";
import csrf from "csurf";
import {
	graphql,
	lexicographicSortSchema,
	print,
	printSchema,
	stripIgnoredCharacters,
} from "graphql";
import { introspectSchema } from "@graphql-tools/wrap";
import { stitchSchemas } from "@graphql-tools/stitch";
import { randomBytes, createHash } from "crypto";

import { Logger } from "../../../adapter/internal/logger/logger";
import { useStore } from "../../../utilities/store";
import { defineRoute } from "../../route";
import { gql, sendError } from "../../utilities";
import { useSchema } from "../../api/use-schema-definition";

const csrfProtection = (
	req: IncomingMessage,
	res: ServerResponse,
	next: (err?: Error) => any,
) => {
	const csrfProtection = csrf({ cookie: true });

	return csrfProtection(
		{ ...req, cookies: useCookies(req) } as any,
		res as any,
		next as any,
	);
};

export default defineRoute({
	route: "/api",
	method: ["post"],
	middleware: [csrfProtection],
	protected: true,
	enabled: true,
	async setup(config) {
		{
			if (config?.routes?.api?.protected)
				this.protected = !!config.routes.api.protected;
			if (config?.routes?.api?.enabled)
				this.enabled = !!config.routes.api.enabled;
			if (config?.routes?.api?.middleware)
				if (Array.isArray(config.routes.api.middleware))
					if (
						config.routes.api.middleware.every(
							(f: any) => typeof f === "function",
						)
					)
						this.middleware?.push(...config.routes.api.middleware);
		}

		const [, setSchema] = useStore("schema");

		let subgraphs = [];
		if (config?.routes?.api?.subgraphs) {
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
		}

		const localSchema = await useSchema();

		const schema = setSchema(
			stitchSchemas({
				subschemas: [...subgraphs, { schema: localSchema }],
			}),
		);

		registerSchema(schema);
	},
	use: async (e, useModule) => {
		try {
			const [schema] = useStore("schema");

			const body = await useBody(e.req);

			if (typeof body !== "object" || !body.query)
				throw new Error("Invalid request");

			const result = await graphql({
				schema,
				source: body.query,
				variableValues: body.variables,
				contextValue: { req: e.req, res: e.res, useModule },
			});

			e.req.statusCode = 200;
			e.res.setHeader("Content-Type", "application/json");

			return e.res.end(JSON.stringify(result));
		} catch (error: any) {
			return sendError(e, error);
		}
	},
});

export interface GraphQLSubgraph {
	/**
	 * The remote location of the subgraph
	 */
	location: string;
	/**
	 * A record of the headers if any are required for authorization
	 */
	headers?: Record<string, any>;
	transforms?: Transform[];
}

const registerSchema = (schema: GraphQLSchema) => {
	// Implementation of schema reporting from
	// https://www.apollographql.com/docs/studio/schema/schema-reporting-protocol
	if (
		!process.env.APOLLO_KEY ||
		!process.env.APOLLO_GRAPH_REF ||
		!process.env.APOLLO_SCHEMA_REPORTING
	)
		return;

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

		if (result.status >= 200 && result.status < 300) return await result.json();

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
};
