import type { ServeConfig, Serve } from "./serve/serve";
// @ts-expect-error: This is a virtual module
import * as servePlugins from "#plugins";
// @ts-expect-error: This is a virtual module
import * as serveMiddleware from "#middleware";
// @ts-expect-error: This is a virtual module
import * as serveRoutes from "#routes";
// @ts-expect-error: This is a virtual module
import * as serveAdapters from "#adapters";
// @ts-expect-error: This is a virtual module
import * as serveEntities from "#entities";
import { createServe } from "./serve/serve";
import { config } from "./utilities/config";
import { defineAdapter } from "./adapter/adapter";
import { defineEntity } from "./entity/entity";

export const start = () => {
	initialize().then(listen);
};

const initialize = async () => {
	const c = (await config()) as ServeConfig;

	const serve = createServe(c);

	await Promise.all(
		Object.keys(servePlugins).map(
			async plugin => await servePlugins[plugin](serve),
		),
	);
	await Promise.all(
		Object.keys(serveMiddleware).map(
			async middleware => await serveMiddleware[middleware](serve),
		),
	);
	await Promise.all(
		Object.keys(serveAdapters).map(
			async adapter => await defineAdapter(serveAdapters[adapter])(c),
		),
	);
	await Promise.all(
		Object.keys(serveEntities).map(
			async entity => await defineEntity(serveEntities[entity])(),
		),
	);
	await Promise.all(
		Object.keys(serveRoutes).map(
			async route => await serveRoutes[route](serve),
		),
	);

	await serve.initialize();

	return serve;
};

const listen = (serve: Serve) => {
	serve.listen();
};
