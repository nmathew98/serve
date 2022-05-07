import "module-alias/register";
import moduleAlias from "module-alias";
import Consola from "./adapters/logger/logger";
import makeContext, { ServeContext } from "./listeners/context/context";
import buildMakeModuleLoader, {
	ModuleLoader,
	ModuleLoaderMaker,
} from "./plugins/module-loader";
import makeH3 from "./listeners/h3/h3";
import loadConfig from "./composables/load-config";
import findRootDirectory from "./composables/find-root-directory";
import isPackageInstalled from "./composables/is-package-installed";
import installPackage from "./composables/install-package";

const hooks: ServeHooks = Object.create(null);
let config: Record<string, any> = Object.create(null);
let Sentry: any;

export async function initialize() {
	try {
		await initializeConfig();
		const context = await initializeContext();
		await initializeEntityConfiguration(context);
		await initializeModules(context);
		await initializeScripts(context);
		await listen(context);
	} catch (error: any) {
		return Consola.error(error);
	}
}

export function useProjectConfiguration(hook: () => Promise<void>) {
	hooks.projectConfiguration = hook;
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
	entityConfiguration?: ServeHook;
	scripts?: ServeHook;
}

async function initializeConfig() {
	if (hooks.projectConfiguration) await hooks.projectConfiguration();

	const rootDirectory = await findRootDirectory();
	config = await loadConfig(rootDirectory);

	if (config.alias && typeof config.alias === "object")
		for (const alias in config.alias) {
			const path = config.alias[alias];
			if (typeof path === "string")
				moduleAlias.addAlias(alias, `${rootDirectory}/${path}`);
		}

	if (config.sentry && typeof config.sentry === "object") {
		const requiredPackages = ["@sentry/node", "@sentry/tracing"];

		for (const pkg of requiredPackages) {
			const isInstalled = await isPackageInstalled({ name: pkg });

			if (!isInstalled) await installPackage({ name: pkg });
		}

		const sentry = requiredPackages[0] as string;
		const sentryTracing = requiredPackages[1] as string;

		Sentry = await import(sentry);

		if (Sentry) {
			await import(sentryTracing);

			Sentry.init(config.sentry);
		}
	}
}

async function initializeContext() {
	const context = makeContext();

	context.set("Logger", Consola);

	if (Sentry) context.set("Sentry", Sentry);

	return context;
}

async function initializeEntityConfiguration(context: ServeContext) {
	if (hooks.entityConfiguration) await hooks.entityConfiguration(context);
}

async function initializeModules(context: ServeContext) {
	const makeModuleLoader: ModuleLoaderMaker = buildMakeModuleLoader({
		Logger: Consola,
	});
	const moduleLoader: ModuleLoader = makeModuleLoader(context);

	await moduleLoader.load();
}

async function initializeScripts(context: ServeContext) {
	if (hooks.scripts) await hooks.scripts(context);
}

async function listen(context: ServeContext) {
	const h3 = makeH3(context, config);

	await h3.initialize();
	await h3.listen();
}
