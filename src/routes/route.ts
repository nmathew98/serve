import { IncomingMessage, ServerResponse } from "h3";
import { Router } from "../listeners/app/app";
import { ServeContext } from "../listeners/context/context";
import { doesModuleExist } from "../plugins/utilities";
import { HttpErrorCodes, sendError, VerifyAuthorization } from "./utilities";

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
 */
export function Route<T extends { new (...args: any[]): Record<string, any> }>(
	path: string,
) {
	return (constructor: T) => {
		return class extends constructor {
			useRoute(router: Router, context: ServeContext) {
				if (this.modules) doesModuleExist(context, ...this.modules);

				if (this.protected) {
					router.use(
						path,
						async (request: IncomingMessage, response: ServerResponse) => {
							try {
								await verifyAuthorization(
									request,
									response,
									context,
									this.payload,
								),
									this.methods;

								return await (this as unknown as BaseRoute).use(
									request,
									response,
									context,
								);
							} catch (error: any) {
								return sendError(response, error.message, error?.statusCode);
							}
						},
					);
				} else
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

/**
 * Decorator to specify the modules a route uses
 *
 * Must be used before the `Route` decorator
 *
 * @param {string} modules the modules the route uses
 */
export function Modules<
	T extends { new (...args: any[]): Record<string, any> },
>(...modules: string[]) {
	return (constructor: T) => {
		return class extends constructor {
			modules = modules;
		} as any;
	};
}

/**
 * Decorator to specify if a route is protected
 *
 * Must be used before the `Route` decorator
 *
 * @param {Record<string, any>} payload the payload for the authorization verifier
 */
export function Protected<
	T extends { new (...args: any[]): Record<string, any> },
>(payload?: Record<string, any>) {
	return (constructor: T) => {
		if (payload) {
			return class extends constructor {
				protected = true;
				payload = payload;
			} as any;
		} else
			return class extends constructor {
				protected = true;
			} as any;
	};
}

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

async function verifyAuthorization(
	request: IncomingMessage,
	_: ServerResponse,
	context: ServeContext,
	payload?: Record<string, any>,
) {
	if (!context.has("configuration:routes:authorization:verify"))
		throw new RouteError("Routes configured incorrectly");

	const verifyAuthorization: VerifyAuthorization = context.get(
		"configuration:routes:authorization:verify",
	);

	if (typeof verifyAuthorization !== "function")
		throw new RouteError("Routes configured incorrectly");

	await verifyAuthorization(request, payload);
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
