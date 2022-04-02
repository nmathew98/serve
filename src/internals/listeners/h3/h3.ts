import cors from "cors";
import helmet from "helmet";
import { createApp, App as H3, Middleware, useBody } from "h3";
import { Dirent as DirectoryEntry } from "fs";
import { readdir } from "fs/promises";
import { Utils } from "../../utils/utils";
import listenerBlacklist from "../../../external/routes/blacklist.json";
import { createServer } from "http";
import { resolve } from "path/posix";
import { Route as H3Route } from "../../../external/routes/route";
import { ServeContext } from "../../context/context";
import { Logger } from "../../logger/logger";

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
				const port: number = +((process.env.PORT as string) || "3000");

				createServer(h3).listen(port);
				Logger.log(`H3 server is up and running on port ${port}!`);
			},
			initializeRequestHandlers: async () => {
				h3.use(cors());
				h3.use(helmet() as Middleware);

				h3.use(async (request: any, _: any, next: any) => {
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
				const files: DirectoryEntry[] = await readdir(rootDirectory, {
					withFileTypes: true,
				});
				const folders: string[] = files
					.filter((file: DirectoryEntry) => file.isDirectory())
					.map((directory: DirectoryEntry) => directory.name);

				for (const folder of folders) {
					if (!(listenerBlacklist.blacklist as string[]).includes(folder)) {
						const routePath: string = Utils.getRoutePath(rootDirectory, folder);

						const routeImport = await import(routePath);
						const route: H3Route = routeImport.default;

						route.useRoute(h3, context);
					}
				}
			},
		});
	};
}
