import { ServerResponse } from "h3";
import useIn from "../composables/use-in";
import { ServeContext } from "../listeners/context/context";

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
	context?: ServeContext,
) {
	response.statusCode = statusCode;
	response.setHeader("Content-Type", "application/json");

	if (context?.has("Sentry")) {
		const currentDate = new Date();
		const currentDateString = currentDate.toDateString();

		const Sentry = context.get("Sentry");
		const name = `${currentDateString} ${response.req.url} [${response.req.method}]`;

		const transaction = Sentry.startTransaction({
			op: "transaction",
			name,
		});

		if (typeof error === "string") Sentry.captureMessage(error);
		else if (error instanceof Error) Sentry.captureException(error);

		transaction.finish();
	}

	return response.end(JSON.stringify({ error }));
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
	response.setHeader("Content-Type", "application/json");

	return response.end(JSON.stringify({ result }));
}

/**
 * Use a value in production
 * @param {T} x value to use in production
 * @param {T} y value to use in development
 * @returns the appropriate value
 */
export function useProduction<T = any>(x: T, y: T) {
	const useInProduction = useIn(process.env.NODE_ENV === "production");

	return useInProduction(x, y);
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
