import { H3 } from "..";
import { Router } from "../listeners/app/app";
import { ServeContext } from "../listeners/context/context";
import { HttpErrorCodes } from "./utilities";

export abstract class BaseRoute {
	/**
	 * Use a route with the app
	 *
	 * @param {App} app the app
	 * @param {ServeContext} context the global context object
	 */
	abstract use(
		request: H3.IncomingMessage,
		response: H3.ServerResponse,
		context: ServeContext,
	): any;
}

export function Route<T extends { new (...args: any[]): {} }>(
	path: string,
	method?: HTTPMethod[],
) {
	return (constructor: T) => {
		return class extends constructor {
			useRoute(router: Router, context: ServeContext) {
				router.use(
					path,
					(request: H3.IncomingMessage, response: H3.ServerResponse) =>
						(this as unknown as BaseRoute).use(request, response, context),
					method,
				);
			}
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
	| "get"
	| "head"
	| "post"
	| "put"
	| "delete"
	| "connect"
	| "options";

export class RouteError extends Error implements RouteError {
	constructor(message: string, statusCode?: HttpErrorCodes) {
		super(message);

		this.statusCode = statusCode;
	}
}

export interface RouteError {
	/**
	 * The error message
	 */
	message: string;

	/**
	 * The HTTP status code
	 */
	statusCode?: HttpErrorCodes;
}
