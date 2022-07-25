import type { NodeOptions as SentryOptions } from "@sentry/node";
import type { Http2SecureServer } from "http2";
import type { Server } from "http";
import type { CorsOptions } from "cors";
import type { HelmetOptions } from "helmet";
import type { Hookable } from "hookable";
import type { Transform } from "@graphql-tools/delegate";
import type { CompatibilityEventHandler } from "h3";
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
	server?: {
		ssl?: {
			key: string;
			cert: string;
		};
		parcel?: Record<string, any>;
	};
	middleware?: {
		cors?: CorsOptions;
		helmet?: HelmetOptions;
		[key: string]: any;
	};
	routes?: {
		api?: {
			protected?: boolean;
			enabled?: boolean;
			middleware?: CompatibilityEventHandler[];
			subgraphs?: GraphQLSubgraph[]
			subscriptions?: boolean
		}
		[key: string]: any;
	};
	adapters?: {
		sentry?: SentryOptions;
		[key: string]: any;
	};
	alias?: {
		[key: string]: string;
	};
}

export interface GraphQLSubgraph {
	/**
	 * The remote location of the subgraph
	 */
	location: string;
	/**
	 * A record of the headers if any are required for authorization
	 */
	headers?: Record<string, any>;
	/**
	 * Transforms for the subgraph
	 */
	transforms?: Transform[];
}

export const createServe = (config: Partial<ServeConfig>) => {
	const router = createRouter();
	const app = createApp().use(router);
	const useModule = (key: string | symbol) => useStore(key, moduleStore);
	const [, setApp] = useStore("app");

	setApp(app);

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
