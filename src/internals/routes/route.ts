import { App } from "$internals/app/app";
import { ServeContext } from "$internals/context/context";

export interface Route {
	/**
	 * Use a route with the app
	 *
	 * @param {App} app the app
	 * @param {ServeContext} context the global context object
	 */
	useRoute(app: App, context: ServeContext): void;
}
