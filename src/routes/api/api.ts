import { IncomingMessage, ServerResponse, useBody } from "h3";
import { graphql, GraphQLSchema } from "graphql";
import { ServeContext } from "../../listeners/context/context";
import { BaseRoute } from "../../routes/route";
import { sendError } from "../../routes/utilities";
import useSchema from "./schema/schema";
import makeSubscriptionListener from "./subscriptions/websocket/websocket";
import { Methods } from "../../composables/decorators/methods";
import { Route } from "../../composables/decorators/route";

let schema: GraphQLSchema;

@Methods("post")
@Route("/api")
export default class API extends BaseRoute {
	private requiresSubscriptions = false;
	// @ts-expect-error Only used by the decorator
	private protected = true;

	constructor(config: Record<string, any>) {
		super();

		this.requiresSubscriptions = !!config.routes.api.graphql.subscription;
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

			if (!schema)
				schema = await useSchema(
					request,
					response,
					context,
					this.requiresSubscriptions,
				);

			const result = await graphql({
				schema,
				source: body.query,
				variableValues: body.variables,
			});

			if (this.requiresSubscriptions)
				if (!context.has("graphql:ws:listening")) {
					const ws = makeSubscriptionListener(context);

					await ws.initialize();
					await ws.listen();
				}

			response.statusCode = 200;
			response.setHeader("Content-Type", "application/json");

			return response.end(JSON.stringify(result));
		} catch (error: any) {
			return sendError(response, { error: error.message, stack: error.stack });
		}
	}
}
