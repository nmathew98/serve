import { IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "../listeners/context/context";
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
