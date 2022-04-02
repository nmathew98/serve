import cors from "cors";
import helmet from "helmet";
import { createApp, App as H3, Middleware, useBody } from "h3";
import { readdir } from "fs/promises";
import { Utils } from "$internals/utilities/utilities";
import listenerBlacklist from "$routes/blacklist.json";
import { createServer } from "http";
import { resolve } from "path/posix";
import { Route as H3Route } from "$routes/route";
import { ServeContext } from "$internals/context/context";
import { Logger } from "$internals/logger/logger";

export interface H3Listener {
	initialize: () => Promise<void>;
	listen: () => Promise<void>;
	initializeRequestHandlers: () => Promise<void>;
	initializeRoutes: () => Promise<void>;
}

export default function buildMakeH3Listener({ Logger }: { Logger: Logger }) {
	return function makeH3Listener(context: ServeContext): H3Listener {
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

				h3.use(async (request, _, next) => {
					Logger.log(`${request.method} ${request.url}`);
					Logger.log(
						`Request headers: ${JSON.stringify(request.headers, null, 2)}`,
					);
					Logger.log(
						`Request body: ${JSON.stringify(await useBody(request), null, 2)}`,
					);

					next();
				});
			},
			initializeRoutes: async () => {
				const rootDirectory = resolve(__dirname, "../../../external/routes/");
				const files = await readdir(rootDirectory, {
					withFileTypes: true,
				});
				const folders = files
					.filter(file => file.isDirectory())
					.map(directory => directory.name);

				for (const folder of folders) {
					if (!(listenerBlacklist.blacklist as string[]).includes(folder)) {
						const routePath = Utils.getRoutePath(rootDirectory, folder);

						const routeImport = await import(routePath);
						const route: H3Route = routeImport.default;

						route.useRoute(h3, context);
					}
				}
			},
		});
	};
}
