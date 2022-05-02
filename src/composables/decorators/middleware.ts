import { Middleware } from "h3";

export function Middleware<
	T extends { new (...args: any[]): Record<string, any> },
>(...middleware: Middleware[]) {
	return (constructor: T) => {
		return class extends constructor {
			middleware = middleware;
		} as any;
	};
}
