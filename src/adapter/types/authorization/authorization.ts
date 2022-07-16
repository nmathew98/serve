import type { IncomingMessage } from "h3";

export interface Authorization {
	get: (req: IncomingMessage, options?: Record<string, any>) => Promise<any>;
	verify: (req: IncomingMessage, options?: Record<string, any>) => Promise<any>;
}

export const SymbolAuthorization = Symbol("Authorization");
