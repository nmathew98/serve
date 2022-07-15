import type { IncomingMessage, ServerResponse } from "h3";

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
	req: IncomingMessage,
	res: ServerResponse,
) => Promise<any>;

export const SymbolStorage = Symbol("Storage");
