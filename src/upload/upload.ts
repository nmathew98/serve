import { IncomingMessage } from "h3";

export interface Upload {
	/**
	 * Handle a file upload
	 */
	handle: FileUploadHandler;

	/**
	 * Remove a file
	 */
	remove: FileRemoveHandler;
}

interface FileUploadHandler {
	(request: IncomingMessage, file: Partial<File>[]): Promise<
		Record<string, any>
	>;
}

interface FileRemoveHandler {
	(request: IncomingMessage, identifiers: Record<string, any>): Promise<
		Record<string, any>
	>;
}

interface File {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	size: string;
	destination: string;
	filename: string;
	path: string;
	buffer: Buffer;
}
