import Winston from "./adapters/logger/logger";
import CliColors from "./adapters/colors/colors";
import Emoji from "./adapters/emoji/emoji";
import buildMakeListeners, {
	Listener,
	ListenerMaker,
} from "./listeners/listeners";
import makeContext, { ServeContext } from "./listeners/context/context";
import buildMakeModuleLoader, {
	ModuleLoader,
	ModuleLoaderMaker,
} from "./plugins/module-loader/module-loader";

const hooks: ServeHooks = Object.create(null);

export async function initialize() {
	try {
		await initializeConfig();
		const context = await initializeContext();
		await initializeEntityConfiguration(context);
		await initializeModules(context);
		await initializeScripts(context);
		await listen(context);
	} catch (error: any) {
		return Winston.error(CliColors.red(error));
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

export function useScripts(hook: ServeHook) {
	hooks.scripts = hook;
}

type ServeHook = (context: ServeContext) => Promise<void>;

interface ServeHooks {
	projectConfiguration?: () => Promise<void>;
	serveConfiguration?: ServeHook;
	entityConfiguration?: ServeHook;
	scripts?: ServeHook;
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
}

async function initializeModules(context: ServeContext) {
	const makeModuleLoader: ModuleLoaderMaker = buildMakeModuleLoader({
		Logger: Winston,
		Colors: CliColors,
		Emoji: Emoji,
	});
	const moduleLoader: ModuleLoader = makeModuleLoader(context);

	await moduleLoader.load();
}

async function initializeScripts(context: ServeContext) {
	if (hooks.scripts) await hooks.scripts(context);
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
