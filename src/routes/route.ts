import { App } from "../app/app";
import { ServeContext } from "../context/context";
import { HttpErrorCodes } from "./utilities";

export interface Route {
	/**
	 * Use a route with the app
	 *
	 * @param {App} app the app
	 * @param {ServeContext} context the global context object
	 */
	useRoute(app: App, context: ServeContext): void;
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
