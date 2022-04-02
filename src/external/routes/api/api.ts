import { IncomingMessage, ServerResponse, useBody, createRouter } from "h3";
import { graphql, GraphQLSchema } from "graphql";
import { ServeContext } from "$internals/context/context";
import { Route } from "$routes/route";
import { sendError, sendSuccess } from "$routes/utilities";
import useSchema from "./schema/schema";
import makeSubscriptionListener from "./subscriptions/websocket/websocket";

let schema: GraphQLSchema;

async function api(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	try {
		const body = await useBody(request);

		if (typeof body !== "object" || !body.query)
			return sendError(response, "Invalid request");

		if (!schema) schema = await useSchema(request, response, context);

		const result = await graphql({
			schema,
			source: body.query,
			variableValues: body.variables,
		});

		if (context.has("configuration:graphql:subscription"))
			if (context.get("configuration:graphql:subscription"))
				if (!context.has("configuration:graphql:ws:listening")) {
					const ws = makeSubscriptionListener(context);

					await ws.initialize();
					await ws.listen();
				}

		if (result.errors) return sendError(response, result.errors);
		else return sendSuccess(response, result.data);
	} catch (error: any) {
		return sendError(response, error.message);
	}
}

const API: Route = {
	useRoute: (app, context) => {
		const router = createRouter().post(
			"/api",
			(request: IncomingMessage, response: ServerResponse) =>
				api(request, response, context),
		);

		app.use(router);
	},
};

export default API;
