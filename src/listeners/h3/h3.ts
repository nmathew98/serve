import cors from "cors";
import helmet from "helmet";
import {
	createApp,
	App as H3,
	Middleware,
	IncomingMessage,
	createRouter,
} from "h3";
import { readdir } from "fs/promises";
import { createServer } from "http";
import { resolve } from "path/posix";
import { ServeContext } from "../context/context";
import { Logger } from "../../adapters/logger/logger";
import { Listener } from "../listeners";
import { Colors } from "../../adapters/colors/colors";
import { Emoji } from "../../adapters/emoji/emoji";
import API from "../../routes/api/api";
import StorageUpload from "../../routes/storage-upload/storage-upload";
import StorageRemove from "../../routes/storage-remove/storage-remove";
import { findOutputDirectory } from "../../utilities/directory/directory";

export default function buildMakeH3Listener({
	Logger,
	Colors,
	Emoji,
}: {
	Logger: Logger;
	Colors: Colors;
	Emoji: Emoji;
}) {
	return function makeH3Listener(context: ServeContext): Listener {
		const h3: H3 = createApp();
		const router = createRouter();

		let routeBlacklist: string[];

		if (!context.has("configuration:route:blacklist")) routeBlacklist = [];
		else routeBlacklist = context.get("configuration:route:blacklist");

		if (!Array.isArray(routeBlacklist))
			throw new Error("Route blacklist must be a string array");
		if (Array.isArray(routeBlacklist) && routeBlacklist.length > 0)
			if (!routeBlacklist.every(item => typeof item === "string"))
				throw new Error("Route blacklist must be a string array");

		const initializeRequestHandlers = async () => {
			let corsConfiguration: Record<string, any> = Object.create(null);
			let helmetConfiguration: Record<string, any> = Object.create(null);

			if (context.has("configuration:cors"))
				corsConfiguration = context.get("configuration:cors");

			if (typeof corsConfiguration !== "object")
				throw new TypeError("CORS configuration must be an object");

			if (context.has("configuration:helmet"))
				helmetConfiguration = context.get("configuration:helmet");

			if (typeof helmetConfiguration !== "object")
				throw new TypeError("Helmet configuration must be an object");

			h3.use(cors(corsConfiguration));
			h3.use(helmet(helmetConfiguration) as Middleware);

			h3.use(async (request: IncomingMessage) => {
				const information = {
					method: request.method,
					url: request.url,
					httpVersion: request.httpVersion,
					headers: request.headers,
				};
				Logger.log(JSON.stringify(information, null, 2));
			});
		};

		const initializeInternalRoutes = () => {
			routeBlacklist.push(getApiRouteFolderName(context));
			const apiRoute = new API();

			(apiRoute as any).useRoute(h3, context);

			if (context.has("Upload")) {
				const storageUploadRoute = new StorageUpload();
				const storageRemoveRoute = new StorageRemove();

				(storageUploadRoute as any).useRoute(h3, context);
				(storageRemoveRoute as any).useRoute(h3, context);
			}
		};

		const initializeRoutes = async () => {
			initializeInternalRoutes();

			try {
				const sourceDirectory = await findOutputDirectory();
				const rootDirectory = resolve(sourceDirectory, "./external/routes/");
				const files = await readdir(rootDirectory, {
					withFileTypes: true,
				});
				const routes = files
					.filter(file => file.isDirectory())
					.map(directory => directory.name);

				for (const route of routes) {
					if (!routeBlacklist.includes(route)) {
						const routePath = getRoutePath(rootDirectory, route);

						const { default: importedRouteClass } = await import(routePath);

						const importedRoute = new importedRouteClass(context);

						importedRoute.useRoute(router, context);
					}
				}

				h3.use(router);
			} catch (error: any) {
				Logger.error(Colors.red(error.message, error.stack));
			}
		};

		return Object.freeze({
			async initialize() {
				await initializeRequestHandlers();
				await initializeRoutes();
			},
			listen: async () => {
				const port = +(process.env.PORT ?? "3000");

				context.set(`test:h3`, h3);
				createServer(h3).listen(port);
				Logger.log(
					Colors.brightGreen(`[H3] Listening on port ${port}!`),
					Emoji.rocket,
				);
			},
		});
	};
}

function getRoutePath(base: string, folder: string) {
	return `${base.toLowerCase()}/${folder.toLowerCase()}/${folder.toLowerCase()}`;
}

function getApiRouteFolderName(context: ServeContext) {
	let path: string;
	if (context.has("configuration:routes:api:path"))
		path = context.get("configuration:routes:api:path");
	else path = "/api";

	return path.replaceAll("/", "");
}
