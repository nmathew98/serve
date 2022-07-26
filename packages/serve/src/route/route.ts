import type {
	CompatibilityEventHandler,
	RouterMethod,
	CompatibilityEvent,
} from "h3";
import type { Router } from "h3";

import type { Store } from "../utilities/store";
import type { ServeConfig } from "../serve/serve";
import type { Serve } from "../serve/serve";

export interface Route {
	route: string;
	method: RouterMethod[];
	middleware?: CompatibilityEventHandler[];
	protected?: boolean;
	enabled?: boolean; // To allow disabling internal routes
	setup: (config: ServeConfig) => Promise<void>;
	use: (e: CompatibilityEvent, useModule: Store) => Promise<any>;
}

export const defineRoute = (route: Route) => async (serve: Serve) => {
	const category = route.protected ? "protected" : "unprotected";

	if (route.enabled)
		serve.hooks.hookOnce(
			`routes:${category}`,
			async (router: Router, config: ServeConfig, useModule: Store) => {
				await route.setup(config);

				const _handlers = [
					...(route?.middleware ?? []),
					(e: CompatibilityEvent) => route.use(e, useModule),
				];

				route.method.forEach(method =>
					_handlers.forEach(handler => router[method](route.route, handler)),
				);
			},
		);
};