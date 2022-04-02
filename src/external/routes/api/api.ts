import { ServeContext } from "$internals/context/context";
import { IncomingMessage, ServerResponse } from "http";
import { useBody } from "h3";
import { graphql } from "graphql";
import useSchema from "./schema";
import { Route } from "../route";

async function api(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	try {
		const body = await useBody(request);

		if (typeof body !== "object" || !body.query)
			return { error: "Invalid request" };

		return await graphql({
			schema: await useSchema(request, response, context),
			source: body.query,
			variableValues: body.variables,
		});
	} catch (error: any) {
		response.statusCode = 500;

		return { error: "Token(s) are invalid" };
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
