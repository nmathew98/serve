import type { NodeOptions as SentryOptions } from "@sentry/node";
import type { Http2SecureServer } from "http2";
import type { Server } from "http";
import type { CorsOptions } from "cors";
import type { HelmetOptions } from "helmet";
import type { Hookable } from "hookable";
import { createApp, createRouter } from "h3";
import { createHooks } from "hookable";
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
		ssl?: {
			key: string;
			cert: string;
		};
	};
	middleware: {
		cors?: CorsOptions;
		helmet?: HelmetOptions;
		[key: string]: any;
	};
	routes: {
		[key: string]: any;
	};
	adapters: {
		sentry?: SentryOptions;
		[key: string]: any;
	};
	alias: {
		[key: string]: string;
	};
}

export const createServe = (config: Partial<ServeConfig>) => {
	const app = createApp();
	const router = createRouter();
	const useModule = (key: string | symbol) => useStore(key, moduleStore);

	const hooks: Hookable<any, any> = createHooks();

	const handlerArguments = [router, config, useModule];

	return Object.freeze({
		hooks,
		initialize: async () => {
			await hooks.callHookParallel("plugins", config, app, router);

			await hooks.callHookParallel(
				"middleware:unprotected",
				...handlerArguments,
			);
			await hooks.callHookParallel("routes:unprotected", ...handlerArguments);

			await hooks.callHookParallel("middleware:protected", ...handlerArguments);
			await hooks.callHookParallel("routes:protected", ...handlerArguments);
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