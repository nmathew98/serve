import cors from "cors";
import helmet from "helmet";
import { createApp, App as H3, Middleware, IncomingMessage } from "h3";
import { readdir } from "fs/promises";
import { createServer } from "http";
import { resolve } from "path/posix";
import { ServeContext } from "../../context/context";
import { Logger } from "../../logger/logger";
import { Listener } from "../listeners";
import { Colors } from "../../colors/colors";
import { Emoji } from "../../emoji/emoji";
import API from "../../routes/api/api";
import findSourceDirectory from "../../directory/directory";

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

		const initializeRoutes = async () => {
			routeBlacklist.push(getApiRouteFolderName(context));
			API.useRoute(h3, context);

			try {
				const sourceDirectory = await findSourceDirectory();
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

						const { default: importedRoute } = await import(routePath);

						importedRoute.useRoute(h3, context);
					}
				}
			} catch (error: any) {
				Logger.error(Colors.red(error.message));
			}
		};

		return Object.freeze({
			async initialize() {
				await initializeRequestHandlers();
				await initializeRoutes();
			},
			listen: async () => {
				const port = +(process.env.PORT ?? "3000");

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