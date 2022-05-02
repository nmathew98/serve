/**
 * Decorator to specify the valid HTTP methods for a route
 *
 * Must be used before the `Route` decorator
 *
 * @param {string[]} methods rest parameter of HTTP methods
 */
export function Methods<
	T extends { new (...args: any[]): Record<string, any> },
>(...methods: HTTPMethod[]) {
	return (constructor: T) => {
		return class extends constructor {
			methods = methods;
		} as any;
	};
}

type HTTPMethod =
	| "get"
	| "head"
	| "patch"
	| "put"
	| "delete"
	| "connect"
	| "options"
	| "trace"
	| "post";
