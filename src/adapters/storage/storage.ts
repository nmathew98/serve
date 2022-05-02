import { IncomingMessage, ServerResponse } from "h3";
import { Readable } from "stream";

export interface Storage {
	/**
	 * Handle a file upload
	 */
	upload: StorageHandler;

	/**
	 * Remove a file
	 */
	remove: StorageHandler;

	/**
	 * Stream a file
	 */
	stream: StorageHandler;
}

type StorageHandler = (
	request: IncomingMessage,
	response: ServerResponse,
) => Promise<Record<string, any> | Readable>;
