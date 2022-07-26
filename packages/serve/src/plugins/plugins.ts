import type { App, Router } from "h3";
import type { Serve, ServeConfig } from "../serve/serve";

export type ServePlugin = (
	config: ServeConfig,
	app: App,
	router: Router,
) => Promise<void>;

export const definePlugin = (plugin: ServePlugin) => async (serve: Serve) => {
	serve.hooks.hookOnce("plugins", plugin);
};
