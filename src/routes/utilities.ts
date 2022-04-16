import { ServeContext } from "../context/context";
import { IncomingMessage, ServerResponse } from "h3";

/**
 * Send an error response
 *
 * @param {ServerResponse} response the response
 * @param {any} error the error
 * @param {HttpErrorCodes} statusCode the status code
 * @returns an error object
 */
export function sendError(
	response: ServerResponse,
	error: any,
	statusCode: HttpErrorCodes = 500,
) {
	response.statusCode = statusCode;

	return { error };
}

/**
 * Send an success response
 *
 * @param {ServerResponse} response the response
 * @param {any} result the result
 * @param {HttpSuccessCodes} statusCode the status code
 * @returns an result object
 */
export function sendSuccess(
	response: ServerResponse,
	result: any,
	statusCode: HttpSuccessCodes = 200,
) {
	response.statusCode = statusCode;

	return { result };
}

/**
 * Use a value in production
 * @param {T} x value to use in production
 * @param {T} y value to use in development
 * @returns the appropriate value
 */
export function useProduction<T = any>(x: T, y: T) {
	return process.env.NODE_ENV === "production" ? x : y;
}

/**
 * Get the name of the folder which contains the api route
 *
 * @param {ServeContext} context the ServeContext
 * @returns the folder which contains the api route
 */
export function getApiRouteFolderName(context: ServeContext) {
	let path: string;
	if (context.has("configuration:routes:api:path"))
		path = context.get("configuration:routes:api:path");
	else path = "/api";

	return path.replaceAll("/", "");
}

/**
 * To verify the authorization status of a user
 *
 * @param {IncomingMessage} request The request from h3
 * @param {Record<string, any> | undefined} payload any other options which are needed
 * @returns a string or void
 */
export type VerifyAuthorization = (
	request: IncomingMessage,
	payload?: Record<string, any>,
) => Promise<string | Record<string, any> | void>;

/**
 * To get the authorization confirmation of a user
 *
 * @param {IncomingMessage} request The request from h3
 * @param {Record<string, any> | undefined} payload any other options which are needed
 * @returns a string
 */
export type GetAuthorization = (
	request: IncomingMessage,
	payload?: Record<string, any>,
) => Promise<string | Record<string, any>>;

/**
 * HTTP success status codes
 */
export type HttpSuccessCodes =
	| 200
	| 201
	| 202
	| 203
	| 204
	| 205
	| 206
	| 207
	| 208
	| 226;

/**
 * HTTP error status codes
 */
export type HttpErrorCodes =
	| 400
	| 401
	| 402
	| 403
	| 404
	| 405
	| 406
	| 407
	| 408
	| 409
	| 410
	| 411
	| 412
	| 413
	| 415
	| 416
	| 417
	| 418
	| 421
	| 422
	| 423
	| 424
	| 425
	| 426
	| 428
	| 429
	| 431
	| 451
	| 500
	| 501
	| 502
	| 503
	| 504
	| 506
	| 507
	| 508
	| 510
	| 511;
