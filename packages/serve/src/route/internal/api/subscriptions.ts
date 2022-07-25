import { createHandler } from "graphql-sse";

import { useStore } from "../../../utilities/store";
import { defineRoute } from "../../route";

let subscriptionHandler: ReturnType<typeof createHandler>;

export default defineRoute({
	route: "/api/subscriptions",
	method: ["post"],
	middleware: [],
	protected: true,
	enabled: true,
	async setup(config) {
		{
			const hasProtectedConfig = config?.routes?.api?.protected ?? false;
			const hasEnabledConfig = config?.routes?.api?.enabled ?? false;
			const hasSubscriptionsConfig = config?.routes?.api?.subscriptions ?? false;
			const hasMiddlewareConfig = config?.routes?.api?.middleware ?? false;

			if (hasProtectedConfig)
				this.protected = !!hasProtectedConfig;
			if (hasSubscriptionsConfig)
				this.enabled =
					!!hasEnabledConfig && !!hasSubscriptionsConfig;
			if (hasMiddlewareConfig)
				if (Array.isArray(config?.routes?.api?.middleware))
					if (
						config?.routes?.api?.middleware.every(
							(f: any) => typeof f === "function",
						)
					)
						this.middleware?.push(...config.routes.api.middleware);
		}

		// Assuming schema has already been stiched together here
		// The API route must be initialized first before the subscription route
		const [schema] = useStore("schema");
		subscriptionHandler = createHandler({ schema });
	},
	use: async e => subscriptionHandler(e.req, e.res),
});
