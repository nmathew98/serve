import useSchema from "./schema/schema";
import { Methods } from "../../composables/decorators/methods";
import { Route } from "../../composables/decorators/route";
import { createHandler as createSubscriptionHandler } from "graphql-sse";
import { BaseRoute } from "../route";
import { IncomingMessage, ServerResponse, useBody } from "h3";
import { ServeContext } from "../../listeners/context/context";
import { sendError } from "../utilities";

let subscriptionHandler: ReturnType<typeof createSubscriptionHandler>;

@Methods("post")
@Route("/api/:option")
export default class ApiOption extends BaseRoute {
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

			const schema = await useSchema(request, response, context);

			switch (option) {
				case "subscriptions": {
					if (!subscriptionHandler)
						subscriptionHandler = createSubscriptionHandler({
							schema,
						});

					return subscriptionHandler(request, response);
				}
				default:
					throw new Error("Invalid option");
			}
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
