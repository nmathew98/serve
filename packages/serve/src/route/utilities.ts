import type { CompatibilityEvent } from "h3";

/**
 * Send an error response
 *
 * @param {CompatibilityEvent} e the response
 * @param {any} error the result
 * @param {HttpSuccessCodes} statusCode the status code
 * @returns an result object
 */
export const sendError = (
	e: CompatibilityEvent,
	error: any,
	statusCode: HttpErrorCodes = 500,
) => {
	e.res.statusCode = statusCode;
	e.res.setHeader("Content-Type", "application/json");

	return e.res.end(JSON.stringify({ error }));
};

/**
 * Send a success response
 *
 * @param {CompatibilityEvent} e the response
 * @param {any} result the result
 * @param {HttpSuccessCodes} statusCode the status code
 * @returns an result object
 */
export const sendSuccess = (
	e: CompatibilityEvent,
	result: any,
	statusCode: HttpSuccessCodes = 200,
) => {
	e.res.statusCode = statusCode;
	e.res.setHeader("Content-Type", "application/json");

	return e.res.end(JSON.stringify({ result }));
};

/**
 * Provides syntax highlighting for GraphQL strings
 *
 * @param {string} x a template string
 * @returns a string
 */
export const gql = String.raw;

/**
 * HTTP success status codes
 */
type HttpSuccessCodes =
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
type HttpErrorCodes =
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
