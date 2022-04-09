import "module-alias/register";
import Winston from "$internals/logger/logger";
import CliColors from "$internals/colors/colors";
import Emoji from "$internals/emoji/emoji";
import dotenv from "dotenv";
import buildMakeListeners, {
	Listener,
	ListenerMaker,
} from "$internals/listeners/listeners";
import makeContext, { ServeContext } from "$internals/context/context";
import buildMakeModuleLoader, {
	ModuleLoader,
	ModuleLoaderMaker,
} from "$internals/module-loader/module-loader";
import {
	GetAuthorization,
	VerifyAuthorization,
} from "$internals/routes/utilities";

let context: ServeContext;

initializeConfig()
	.then(initializeContext)
	.then(initializeEntityConfiguration)
	.then(initializeModules)
	.then(listen)
	.catch((error: any) => {
		Winston.error(CliColors.red(error));
	});

async function initializeConfig() {
	dotenv.config();
}

async function initializeContext() {
	context = makeContext();

	// Set CORS configuration here
	context.set("configuration:cors", {
		origin: (
			origin: string,
			callback: (error: Error | null, origin: string | boolean) => void,
		) => {
			const allowedOrigins: string[] = [];
			if (allowedOrigins.includes(origin)) return callback(null, origin);

			return callback(null, false);
		},
	});

	// Set Helmet configuration here
	context.set("configuration:helmet", Object.create(null));

	// If you need GraphQL subscriptions set this to true
	context.set("configuration:graphql:subscription", true);
	// If no value is set, it defaults to 4000
	context.set("configuration:graphql:ws:port", 5000);

	// If route access is restricted set the functions(!) to
	// verify and get authorization confirmation here

	// The value must conform to the VerifyAuthorization type
	// Import it from `$internals/routes/utilities`
	// Throw a RouteError if error
	const verifyAuthorization: VerifyAuthorization = Object.create(null);
	context.set("configuration:routes:authorization:verify", verifyAuthorization);

	// The value must conform to the GetAuthroization type
	// Import it from `$internals/routes/utilities`
	// Throw a RouteError if error
	const getAuthorization: GetAuthorization = Object.create(null);
	context.set("configuration:routes:authorization:get", getAuthorization);

	// If route access is restricted, set the options for the API route
	// to pass to verifyAuthorization here
	context.set("configuration:routes:api:verify", Object.create(null));
}

async function initializeEntityConfiguration() {
	// Set the entity configuration here
	context.set("configuration:entity:Example", Object.create(null));
}

async function initializeModules() {
	const makeModuleLoader: ModuleLoaderMaker = buildMakeModuleLoader({
		Logger: Winston,
		Colors: CliColors,
		Emoji: Emoji,
	});
	const moduleLoader: ModuleLoader = makeModuleLoader(context);

	await moduleLoader.load();
}

async function listen() {
	const makeListeners: ListenerMaker = buildMakeListeners({
		Logger: Winston,
		Colors: CliColors,
		Emoji: Emoji,
	});
	const listeners: Listener = makeListeners(context);

	await listeners.initialize();
	await listeners.listen();
}
