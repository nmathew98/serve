import type {
	IncomingMessage,
	ServerResponse,
	CompatibilityEventHandler,
	RouterMethod,
} from "h3";
import type { Router } from "h3";

import type { StoreGetter } from "../utilities/store";
import type { ServeConfig } from "../serve/serve";
import type { Serve } from "../serve/serve";

export interface Route {
	route: string;
	method: RouterMethod[];
	middleware?: CompatibilityEventHandler[];
	protected?: boolean;
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
		serve.hooks.hookOnce(
			`routes:${category}`,
			async (router: Router, config: ServeConfig, useModule: StoreGetter) => {
				await route.setup(config);

				const _handlers = [
					...(route?.middleware ?? []),
					(req: IncomingMessage, res: ServerResponse) =>
						route.use(req, res, useModule),
				];

				route.method.forEach(method =>
					_handlers.forEach(handler => router[method](route.route, handler)),
				);
			},
		);
};
