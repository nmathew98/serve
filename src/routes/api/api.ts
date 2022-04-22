import { IncomingMessage, assertMethod, ServerResponse, useBody } from "h3";
import { graphql, GraphQLSchema } from "graphql";
import { ServeContext } from "../../context/context";
import { Route } from "../../routes/route";
import { sendError, VerifyAuthorization } from "../../routes/utilities";
import useSchema from "./schema/schema";
import makeSubscriptionListener from "./subscriptions/websocket/websocket";

let schema: GraphQLSchema;

async function api(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	{
		assertMethod(request.event, "POST");

		let verifyAuthorization: VerifyAuthorization;
		let verifyAuthorizationOptions: Record<string, any> | undefined;

		if (context.has("configuration:routes:authorization:verify")) {
			if (context.has("configuration:routes:api:verify")) {
				const verificationOptionsInContext = context.get(
					"configuration:routes:api:verify",
				);

				if (typeof verificationOptionsInContext === "object")
					verifyAuthorizationOptions = verificationOptionsInContext;
			}

			verifyAuthorization = context.get(
				"configuration:routes:authorization:verify",
			);

			if (typeof verifyAuthorization === "function") {
				try {
					await verifyAuthorization(request, verifyAuthorizationOptions);
				} catch (error: any) {
					return sendError(response, error.message, error.statusCode);
				}
			}
		}
	}

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

		response.statusCode = 200;
		return result;
	} catch (error: any) {
		return sendError(response, { error: error.message, stack: error.stack });
	}
}

const API: Route = {
	useRoute: (app, context) => {
		let path: string;

		if (context.has("configuration:routes:api:path"))
			path = context.get("configuration:routes:api:path");
		else path = "/api";

		app.use(path, (request: IncomingMessage, response: ServerResponse) =>
			api(request, response, context),
		);
	},
};

export default API;
