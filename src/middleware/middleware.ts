import type { CompatibilityEventHandler, Router, RouterMethod } from "h3";

import type { Serve, ServeConfig } from "../serve/serve";
import type { Store } from "../utilities/store";

export interface Middleware {
	method?: RouterMethod;
	protected?: boolean;
	use: (config: ServeConfig, useModule: Store) => CompatibilityEventHandler;
}

export const defineMiddleware =
	(middleware: Middleware) => async (serve: Serve) => {
		const category = middleware.protected ? "protected" : "unprotected";

		serve.hooks.hookOnce(
			`middleware:${category}`,
			async (router: Router, config: ServeConfig, useModule: Store) => {
				if (!middleware.method)
					router.use("*", middleware.use(config, useModule));
				else router.use(middleware.method, middleware.use(config, useModule));
			},
		);
	};
