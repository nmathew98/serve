import { IncomingMessage, ServerResponse } from "h3";

export interface Upload {
	/**
	 * Handle a file upload
	 */
	handle: UploadHandler;

	/**
	 * Remove a file
	 */
	remove: UploadHandler;
}

type UploadHandler = (
	request: IncomingMessage,
	response: ServerResponse,
) => Promise<Record<string, any>>;
