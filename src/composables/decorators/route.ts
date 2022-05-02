import { Router, IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "../../listeners/context/context";
import doesModuleExist from "../does-module-exist";
import { BaseRoute } from "../../routes/route";
import { Authorization } from "../../adapters/authorization/authorization";
import { sendError } from "../../routes/utilities";

/**
 * Decorator to use a Route
 *
 * All routes must extend `BaseRoute`
 *
 * @param {string} path the path associated with the route
 */
export function Route<T extends { new (...args: any[]): Record<string, any> }>(
	path: string,
) {
	return (constructor: T) => {
		return class extends constructor {
			useRoute(router: Router, context: ServeContext) {
				if (this.modules) doesModuleExist(context, ...this.modules);

				if (this.protected)
					router.use(
						path,
						async (request: IncomingMessage, response: ServerResponse) => {
							if (!context.has("Authorization"))
								sendError(response, "Authorization module not found", 500);

							const Authorization: Authorization = context.get("Authorization");

							try {
								await Authorization.verify(request);
							} catch (error: any) {
								sendError(response, error?.message, error?.statusCode);
							}
						},
						this.methods,
					);

				if (this.middleware)
					for (const middleware of this.middleware)
						router.use(path, middleware, this.methods);

				router.use(
					path,
					(request: IncomingMessage, response: ServerResponse) =>
						(this as unknown as BaseRoute).use(request, response, context),
					this.methods,
				);
			}
		} as any;
	};
}
