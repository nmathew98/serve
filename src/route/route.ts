import type {
	RouterMethod,
	Middleware,
	Router,
	IncomingMessage,
	ServerResponse,
} from "h3";

import type { StoreGetter } from "../utilities/store";
import type { ServeConfig } from "../serve/serve";
import { Serve } from "../serve/serve";

export interface Route {
	route: string;
	method: RouterMethod[];
	middleware: Middleware[];
	protected: boolean;
	enabled?: boolean; // To allow disabling internal routes
	setup: (config: ServeConfig) => Promise<void>;
	use: (
		request: IncomingMessage,
		response: ServerResponse,
		useModule: StoreGetter,
	) => Promise<any>;
}

export const defineRoute = (route: Route) => async (serve: Serve) => {
	const category = route.protected ? "protected" : "unprotected";

	if (route.enabled)
		serve.hooks.hook(
			`routes:${category}`,
			async (router: Router, useModule: StoreGetter, config: ServeConfig) => {
				await route.setup(config);

				const _handler = (request: IncomingMessage, response: ServerResponse) =>
					route.use(request, response, useModule);

				router.use(route.route, _handler, route.method);
			},
		);
};
