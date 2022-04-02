import { ServeContext } from "$internals/context/context";
import { IncomingMessage, ServerResponse } from "http";
import { useBody } from "h3";
import { graphql, GraphQLSchema } from "graphql";
import useSchema from "./schema";
import { Route } from "../route";
import { sendError, sendSuccess } from "../utilities";

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

		return sendSuccess(
			response,
			await graphql({
				schema,
				source: body.query,
				variableValues: body.variables,
			}),
		);
	} catch (error: any) {
		return sendError(response, error.message);
	}
}

const API: Route = {
	useRoute: (app, context) => {
		app.use("/api", (request: IncomingMessage, response: ServerResponse) =>
			api(request, response, context),
		);
	},
};

export default API;
