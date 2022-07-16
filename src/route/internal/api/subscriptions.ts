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
			if (config?.routes?.api?.protected)
				this.protected = !!config.routes.api.protected;
			if (config?.routes?.api?.subscriptions)
				this.enabled =
					!!config?.routes?.api?.enabled && !!config.routes.api.subscriptions;
			if (config?.routes?.api?.middleware)
				if (Array.isArray(config.routes.api.middleware))
					if (
						config.routes.api.middleware.every(
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
