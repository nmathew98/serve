import cors from "cors";
import helmet from "helmet";
import {
	createApp,
	App as H3,
	Middleware,
	IncomingMessage,
	createRouter,
} from "h3";
import { createServer } from "http";
import { resolve } from "path/posix";
import { ServeContext } from "../context/context";
import API from "../../routes/api/api";
import StorageUpload from "../../routes/storage/upload/upload";
import StorageRemove from "../../routes/storage/remove/remove";
import { BaseRoute } from "../../routes/route";
import Consola from "../../adapters/logger/logger";
import findRootDirectory from "../../composables/find-root-directory";
import ls from "../../composables/ls";
import isConstructor from "../../composables/is-constructor";

export interface Listener {
	initialize(): Promise<void>;

	listen(): Promise<void | ServeContext>;
}

export default function makeH3(
	context: ServeContext,
	config: Record<string, any>,
): Listener {
	const h3: H3 = createApp();
	const router = createRouter();

	const initializeRequestHandlers = async () => {
		h3.use(cors(config.cors ?? Object.create(null)));
		h3.use(helmet(config.helmet ?? Object.create(null)) as Middleware);

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
		const apiRoute = new API(config);

		(apiRoute as any).useRoute(h3, context);

		if (config.routes.upload.enabled) {
			const storageUploadRoute = new StorageUpload();
			const storageRemoveRoute = new StorageRemove();

			(storageUploadRoute as any).useRoute(h3, context);
			(storageRemoveRoute as any).useRoute(h3, context);
		}
	};

	const initializeRoutes = async () => {
		initializeInternalRoutes();

		try {
			const rootDirectory = await findRootDirectory();
			const routes = resolve(rootDirectory, "./dist", "./external/routes/");

			for await (const route of ls(routes)) {
				const { default: importedRouteClass } = await import(route);

				if (importedRouteClass && isConstructor(importedRouteClass)) {
					const importedRoute = new importedRouteClass(context);

					if (importedRoute instanceof BaseRoute)
						if ((importedRoute as any).useRoute)
							(importedRoute as any).useRoute(router, context);
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

			createServer(h3).listen(port);
			Consola.log(`Listening on port ${port}!`);
		},
	});
}
