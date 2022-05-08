import { Router, IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "../../listeners/context/context";
import doesModuleExist from "../does-module-exist";
import { BaseRoute } from "../../routes/route";
import { Authorization } from "../../adapters/authorization/authorization";
import { sendError } from "../../routes/utilities";
import { Logger } from "../../adapters/logger/logger";

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

				const Logger: Logger = context.get("Logger");

				/**
				 * Ordinarily if we use a middleware in some sequence that sequence
				 * will be followed but for some reason its messing up
				 *
				 * Not sure if its a bug with h3 but this should ensure the sequence
				 */
				router.use(
					path,
					async (request: IncomingMessage, response: ServerResponse) => {
						if (this.protected) {
							if (!context.has("Authorization")) {
								Logger.error("Authorization module not found");

								return sendError(
									response,
									"Authorization module not found",
									500,
								);
							}

							const Authorization: Authorization = context.get("Authorization");

							try {
								await Authorization.verify(request);
							} catch (error: any) {
								Logger.error(error);

								return sendError(response, error?.message, error?.statusCode);
							}
						}

						if (!response.writableEnded) {
							if (this.middleware)
								if (Array.isArray(this.middleware))
									for (const middleware of this.middleware)
										if (typeof middleware === "function")
											try {
												await middleware(request, response, context);
											} catch (error: any) {
												Logger.error(error);

												return sendError(
													response,
													error?.message,
													error?.statusCode,
												);
											}

							try {
								return await (this as unknown as BaseRoute).use(
									request,
									response,
									context,
								);
							} catch (error: any) {
								Logger.error(error);

								return sendError(response, error?.message, error?.statusCode);
							}
						}
					},
					this.methods,
				);
			}
		} as any;
	};
}
