import { ServerResponse } from "h3";

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

	return response.end({ error });
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

	return response.end({ result });
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
