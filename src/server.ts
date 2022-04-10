import Winston from "./logger/logger";
import CliColors from "./colors/colors";
import Emoji from "./emoji/emoji";
import buildMakeListeners, {
	Listener,
	ListenerMaker,
} from "./listeners/listeners";
import makeContext, { ServeContext } from "./context/context";
import buildMakeModuleLoader, {
	ModuleLoader,
	ModuleLoaderMaker,
} from "./module-loader/module-loader";

const hooks: ServeHooks = Object.create(null);

export async function initialize() {
	try {
		await initializeConfig();
		const context = await initializeContext();
		await initializeEntityConfiguration(context);
		await initializeModules(context);
		await listen(context);
	} catch (error: any) {
		Winston.error(CliColors.red(error));
	}
}

export function useProjectConfiguration(hook: () => Promise<void>) {
	hooks.projectConfiguration = hook;
}

export function useServeConfiguration(hook: ServeHook) {
	hooks.serveConfiguration = hook;
}

export function useEntityConfiguration(hook: ServeHook) {
	hooks.entityConfiguration = hook;
}

type ServeHook = (context: ServeContext) => Promise<void>;

interface ServeHooks {
	projectConfiguration?: () => Promise<void>;
	serveConfiguration?: ServeHook;
	entityConfiguration?: ServeHook;
}

async function initializeConfig() {
	if (hooks.projectConfiguration) await hooks.projectConfiguration();
}

async function initializeContext() {
	const context = makeContext();

	if (hooks.serveConfiguration) await hooks.serveConfiguration(context);

	context.set("Logger", Winston);

	return context;
}

async function initializeEntityConfiguration(context: ServeContext) {
	if (hooks.entityConfiguration) await hooks.entityConfiguration(context);

	return context;
}

async function initializeModules(context: ServeContext) {
	const makeModuleLoader: ModuleLoaderMaker = buildMakeModuleLoader({
		Logger: Winston,
		Colors: CliColors,
		Emoji: Emoji,
	});
	const moduleLoader: ModuleLoader = makeModuleLoader(context);

	await moduleLoader.load();

	return context;
}

async function listen(context: ServeContext) {
	const makeListeners: ListenerMaker = buildMakeListeners({
		Logger: Winston,
		Colors: CliColors,
		Emoji: Emoji,
	});
	const listeners: Listener = makeListeners(context);

	await listeners.initialize();
	await listeners.listen();
}
