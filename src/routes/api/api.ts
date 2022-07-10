import { IncomingMessage, ServerResponse, useBody } from "h3";
import { graphql, GraphQLSchema, print } from "graphql";
import { ServeContext } from "../../listeners/context/context";
import { BaseRoute } from "../../routes/route";
import { sendError } from "../../routes/utilities";
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
					(location: string, headers = Object.create(null)) =>
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
					.map(async (subgraph: GraphQLSubgraph) => {
						const remoteExecutor = createRemoteExecuter(
							subgraph.location,
							subgraph.headers,
						);

						return {
							schema: await introspectSchema(remoteExecutor),
							executor: remoteExecutor,
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
