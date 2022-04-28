import { IncomingMessage, ServerResponse } from "h3";
import { Readable } from "stream";

export interface Upload {
	/**
	 * Handle a file upload
	 */
	handle: UploadHandler;

	/**
	 * Remove a file
	 */
	remove: UploadHandler;

	/**
	 * Stream a file
	 */
	stream: UploadHandler;
}

type UploadHandler = (
	request: IncomingMessage,
	response: ServerResponse,
) => Promise<Record<string, any> | Readable>;
