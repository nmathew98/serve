import cors from "cors";
import helmet from "helmet";
import {
	createApp,
	App as H3,
	Middleware,
	IncomingMessage,
	createRouter,
} from "h3";
import { createServer as createLegacyServer } from "http";
import { createServer } from "spdy";
import { resolve } from "path/posix";
import { readFile } from "fs/promises";
import { ServeContext } from "../context/context";
import API from "../../routes/api/api";
import StorageUpload from "../../routes/storage/upload/upload";
import StorageRemove from "../../routes/storage/remove/remove";
import { BaseRoute } from "../../routes/route";
import Consola from "../../adapters/logger/logger";
import findRootDirectory from "../../composables/find-root-directory";
import ls from "../../composables/ls";
import isConstructor from "../../composables/is-constructor";
import isJavaScript from "../../composables/is-javascript";
import isPathValid from "../../composables/is-path-valid";

export interface Listener {
	initialize(): Promise<void>;

	listen(): Promise<void | ServeContext>;
}

export default function makeH3(
	context: ServeContext,
	config: Record<string, any>,
): Listener {
	let isLegacyServer = false;

	if (!config?.server?.spdy?.key || !config?.server?.spdy?.cert) {
		isLegacyServer = true;
		Consola.error("No SSL certificate specified, creating legacy server");
	}

	if (
		typeof config.server.spdy.key !== "string" ||
		typeof config.server.spdy.cert !== "string"
	) {
		isLegacyServer = true;
		Consola.error("Invalid SSL certificate specified, creating legacy server");
	}

	const h3: H3 = createApp();
	const router = createRouter();

	const initializeRequestHandlers = async () => {
		h3.use(cors(config.cors ?? Object.create(null)));
		h3.use(helmet(config.helmet ?? Object.create(null)) as Middleware);

		{
			const rootDirectory = await findRootDirectory();
			const middlewares = resolve(
				rootDirectory,
				"./dist",
				"./external/middleware/",
			);

			if (await isPathValid(middlewares))
				for await (const file of ls(middlewares)) {
					if (isJavaScript(file)) {
						const middlewareExport = await import(file);

						if (!middlewareExport.default) continue;

						const importedMiddleware = middlewareExport.default;

						if (importedMiddleware && typeof importedMiddleware === "function")
							h3.use(importedMiddleware);
					}
				}
		}

		h3.use(async (request: IncomingMessage) => {
			const information = {
				method: request.method,
				url: request.url,
				httpVersion: request.httpVersion,
				headers: request.headers,
			};
			Consola.log(JSON.stringify(information, null, 2));
		});
	};

	const initializeInternalRoutes = () => {
		if (config.routes.api.enabled) {
			const apiRoute = new API(config);

			(apiRoute as any).useRoute(h3, context);
		}

		if (config.routes.storage.enabled) {
			const storageUploadRoute = new StorageUpload(config);
			const storageRemoveRoute = new StorageRemove(config);

			(storageUploadRoute as any).useRoute(h3, context);
			(storageRemoveRoute as any).useRoute(h3, context);
		}
	};

	const initializeRoutes = async () => {
		initializeInternalRoutes();

		try {
			const rootDirectory = await findRootDirectory();
			const routes = resolve(rootDirectory, "./dist", "./external/routes/");

			if (await isPathValid(routes))
				for await (const file of ls(routes)) {
					if (isJavaScript(file)) {
						const routeExports = await import(file);

						if (!routeExports.default) continue;

						const importedRouteClass = routeExports.default;

						if (importedRouteClass && isConstructor(importedRouteClass)) {
							const importedRoute = new importedRouteClass(context);

							if (importedRoute instanceof BaseRoute)
								if ((importedRoute as any).useRoute)
									(importedRoute as any).useRoute(router, context);
						}
					}
				}

			h3.use(router);
		} catch (error: any) {
			Consola.error(error.message, error.stack);
		}
	};

	return Object.freeze({
		async initialize() {
			await initializeRequestHandlers();
			await initializeRoutes();
		},
		listen: async () => {
			const port = +(process.env.PORT ?? "4000");

			if (
				!(await isPathValid(config.server.spdy.key)) ||
				!(await isPathValid(config.server.spdy.cert))
			) {
				Consola.error("Unable to find SSL certificate, creating legacy server");
				isLegacyServer = true;
			}

			if (!isLegacyServer) {
				const key = await readFile(config.server.spdy.key);
				const cert = await readFile(config.server.spdy.cert);

				const spdyOptions = {
					...config.server.spdy,
					key,
					cert,
				};

				createServer(spdyOptions, h3).listen(port);
			} else {
				createLegacyServer(h3).listen(port);
			}

			Consola.log(`Listening on port ${port}!`);
		},
	});
}
