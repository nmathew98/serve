import { Middleware } from "h3";

/**
 * Decorator to specify the middleware to be used before the route
 *
 * Must be used before the `Route` decorator
 *
 * @param {Middleware[]} middleware rest parameter of HTTP methods
 */
export function Middleware<
	T extends { new (...args: any[]): Record<string, any> },
>(...middleware: Middleware[]) {
	return (constructor: T) => {
		return class extends constructor {
			middleware = middleware;
		} as any;
	};
}
