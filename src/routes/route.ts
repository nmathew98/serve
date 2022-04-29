import { IncomingMessage, ServerResponse } from "h3";
import { Router } from "../listeners/app/app";
import { ServeContext } from "../listeners/context/context";
import { doesModuleExist } from "../plugins/utilities";
import { HttpErrorCodes } from "./utilities";

/**
 * All routes must extend `BaseRoute`
 */
export abstract class BaseRoute {
	/**
	 * Will be loaded and used with the specified route
	 *
	 * Serve will provide the request, response and context to be used with the route
	 *
	 * @param {IncomingMessage} request the request
	 * @param {ServerResponse} response the response
	 * @param {ServeContext} context the global context provided by Serve
	 */
	abstract use(
		request: IncomingMessage,
		response: ServerResponse,
		context: ServeContext,
	): any;
}

/**
 * Decorator to use a Route
 *
 * All routes must extend `BaseRoute`
 *
 * @param {string} path the path associated with the route
 * @param {HTTPMethod[]} method the HTTP methods the route is valid for
 * @param {string[]} modules the keys of the modules used by the route
 */
export function Route<T extends { new (...args: any[]): Record<string, any> }>(
	path: string,
	method?: HTTPMethod[],
	modules?: string[],
) {
	return (constructor: T) => {
		return class extends constructor {
			useRoute(router: Router, context: ServeContext) {
				if (modules) doesModuleExist(context, ...modules);

				router.use(
					path,
					(request: IncomingMessage, response: ServerResponse) =>
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
	| "post";

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
