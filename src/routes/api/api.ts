import { IncomingMessage, ServerResponse, useBody } from "h3";
import { graphql } from "graphql";
import { ServeContext } from "../../listeners/context/context";
import { BaseRoute } from "../../routes/route";
import { sendError } from "../../routes/utilities";
import useSchema from "./schema/schema";
import { Methods } from "../../composables/decorators/methods";
import { Route } from "../../composables/decorators/route";

@Methods("post")
@Route("/api")
export default class API extends BaseRoute {
	// @ts-expect-error Only used by the decorator
	private protected = true;

	constructor(config: Record<string, any>) {
		super();

		this.protected = !!config.routes.api.protect;
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

			const schema = await useSchema(request, response, context);

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

export interface GraphQLSchemaDefinition {
	definition?: string;
	types?: string;
	resolve?: { [key: string]: AnyFunction };
}

type AnyFunction = (...args: any[]) => any;

export type GraphQLSchemaHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLSchemaDefinition;

export type GraphQLSchemaHandlerAggregator = (
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) => Promise<GraphQLSchemaDefinition[]>;

export function isGraphQLSchemaDefinition(
	o: any,
): o is GraphQLSchemaDefinition {
	if (typeof o !== "object") return false;

	if (!o.types) return false;

	if (o.definition) if (typeof o.definition !== "string") return false;

	if (o.types) if (typeof o.types !== "string") return false;

	if (o.resolve) if (typeof o.resolve !== "function") return false;

	if (o.resolvers) if (!Array.isArray(o.resolvers)) return false;

	return true;
}
