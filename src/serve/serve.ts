import type { NodeOptions as SentryOptions } from "@sentry/node";
import type { Http2SecureServer } from "http2";
import type { Server } from "http";
import type { CorsOptions } from "cors";
import type { HelmetOptions } from "helmet";
import type { Hookable } from "hookable";
import type { IncomingMessage, Middleware, ServerResponse } from "h3";
import { createApp, createRouter } from "h3";
import { createHooks } from "hookable";
import cors from "cors";
import helmet from "helmet";
import { createSecureServer } from "http2";
import { createServer as createLegacyServer } from "http";

import { moduleStore, useStore } from "../utilities/store";
import { readFile } from "fs/promises";

export interface Serve {
	hooks: Hookable;
	initialize: () => Promise<void>;
	listen: () => void;
}
export interface ServeConfig {
	server: {
		cors?: CorsOptions;
		helmet?: HelmetOptions;
		ssl?: {
			key: string;
			cert: string;
		};
	};
	routes: {
		[key: string]: string;
	};
	adapters: {
		sentry?: SentryOptions;
	};
	alias: {
		[key: string]: string;
	};
}

export const createServe = (config: Partial<ServeConfig>) => {
	const app = createApp();
	const router = createRouter();
	const useModule = (key: string | symbol) => useStore(key, moduleStore);
	// TODO: Implement this and move it into middleware directory
	/*eslint @typescript-eslint/no-empty-function: "off"*/
	const authorizationMiddleware = (
		request: IncomingMessage,
		response: ServerResponse,
	) => {};

	app.use(cors(config?.server?.cors));
	app.use(helmet(config?.server?.helmet) as Middleware);

	const hooks: Hookable<any, any> = createHooks();

	const routeArguments = [config, router, useModule];

	return Object.freeze({
		hooks,
		initialize: async () => {
			await hooks.callHookParallel("plugins", config, app, router);
			await hooks.callHookParallel("middleware", app);

			await hooks.callHookParallel("routes:unprotected", ...routeArguments);
			// TODO: Uncomment after implementation
			app.use(authorizationMiddleware);
			await hooks.callHookParallel("routes:protected", ...routeArguments);
		},
		listen: async () => {
			let server: Http2SecureServer | Server;
			if (config?.server?.ssl) {
				server = createSecureServer(
					{
						key: await readFile(config.server.ssl.key),
						cert: await readFile(config.server.ssl.cert),
					},
					app as any,
				);
			} else server = createLegacyServer(app);

			server.listen(process.env.PORT);
		},
	});
};

export const defineServeConfig = (config: Partial<ServeConfig>) =>
	Object.freeze(config);
