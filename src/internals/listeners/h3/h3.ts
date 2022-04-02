import cors from "cors";
import helmet from "helmet";
import { createApp, App as H3, Middleware, IncomingMessage } from "h3";
import { readdir } from "fs/promises";
import routeBlacklist from "$routes/blacklist.json";
import { createServer } from "http";
import { resolve } from "path/posix";
import { ServeContext } from "$internals/context/context";
import { Logger } from "$internals/logger/logger";
import { Listener } from "../listeners";

export default function buildMakeH3Listener({ Logger }: { Logger: Logger }) {
	return function makeH3Listener(context: ServeContext): Listener {
		const h3: H3 = createApp();

		return Object.freeze({
			async initialize() {
				await this.initializeRequestHandlers();
				await this.initializeRoutes();
			},
			listen: async () => {
				const port = +((process.env.PORT as string) || "3000");

				createServer(h3).listen(port);
				Logger.log(`H3 server is up and running on port ${port}!`);
			},
			initializeRequestHandlers: async () => {
				let corsConfiguration: Record<string, any> = Object.create(null);
				let helmetConfiguration: Record<string, any> = Object.create(null);

				if (context.has("configuration:cors"))
					corsConfiguration = context.get("configuration:cors");

				if (context.has("configuration:helmet"))
					helmetConfiguration = context.get("configuration:helmet");

				h3.use(cors(corsConfiguration));
				h3.use(helmet(helmetConfiguration) as Middleware);

				h3.use(async (request: IncomingMessage) => {
					const information = {
						method: request.method,
						url: request.url,
						ip: request.httpVersion,
						headers: request.headers,
					};
					Logger.log(JSON.stringify(information, null, 2));
				});
			},
			initializeRoutes: async () => {
				try {
					const rootDirectory = resolve(__dirname, "../../../external/routes/");
					const files = await readdir(rootDirectory, {
						withFileTypes: true,
					});
					const folders = files
						.filter(file => file.isDirectory())
						.map(directory => directory.name);

					for (const folder of folders) {
						if (!(routeBlacklist.blacklist as string[]).includes(folder)) {
							const routePath = getRoutePath(rootDirectory, folder);

							const { default: route } = await import(routePath);

							route.useRoute(h3, context);
						}
					}
				} catch (error: any) {
					Logger.error(error.message);
				}
			},
		});
	};
}

function getRoutePath(directory: string, routeFolder: string) {
	return `${directory}/${routeFolder}/${routeFolder}.ts`;
}
