import { App } from "../../internals/app/app";
import { ServeContext } from "../../internals/context/context";

export interface Route {
	useRoute(app: App, context: ServeContext): void;
}
