import { ServerResponse } from "h3";

export function sendError(
	response: ServerResponse,
	error: any,
	statusCode: HttpErrorCodes = 500,
) {
	response.statusCode = statusCode;

	return { error };
}

export function sendSuccess(
	response: ServerResponse,
	result: any,
	statusCode: HttpSuccessCodes = 200,
) {
	response.statusCode = statusCode;

	return { result };
}

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
