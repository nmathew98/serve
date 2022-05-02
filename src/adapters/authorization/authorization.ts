import { IncomingMessage } from "h3";

export interface Authorization {
	get: (
		request: IncomingMessage,
		options?: Record<string, any>,
	) => Promise<string | Record<string, any>>;
	verify: (
		request: IncomingMessage,
		options?: Record<string, any>,
	) => Promise<string | Record<string, any> | void>;
}
