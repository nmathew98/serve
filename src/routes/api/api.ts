import { IncomingMessage, ServerResponse, useBody } from "h3";
import { graphql, GraphQLSchema } from "graphql";
import { ServeContext } from "../../listeners/context/context";
import { BaseRoute } from "../../routes/route";
import { sendError } from "../../routes/utilities";
import useSchema from "./schema/schema";
import { Methods } from "../../composables/decorators/methods";
import { Route } from "../../composables/decorators/route";
import { createHandler as createSubscriptionHandler } from "graphql-sse";

let schema: GraphQLSchema;
let subscriptionHandler: ReturnType<typeof createSubscriptionHandler>;

@Methods("post")
@Route("/api/:option")
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
			const option = request.context?.params?.option;
			const body = await useBody(request);

			if (typeof body !== "object" || !body.query)
				return sendError(response, "Invalid request");

			if (!schema) schema = await useSchema(request, response, context);

			if (option === "subscription") {
				if (!subscriptionHandler)
					subscriptionHandler = createSubscriptionHandler({
						schema,
					});

				return subscriptionHandler(request, response);
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
			);
		}
	}
}
