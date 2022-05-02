import { IncomingMessage } from "h3";

export interface Authorization {
	get: (request: IncomingMessage) => Promise<string | Record<string, any>>;
	verify: (
		request: IncomingMessage,
	) => Promise<string | Record<string, any> | void>;
}
