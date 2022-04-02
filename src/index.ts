import "module-alias/register";
import Winston from "$internals/logger/logger";
import dotenv from "dotenv";
import buildMakeListeners, { Listener } from "$internals/listeners/listeners";
import { makeContext, ServeContext } from "$internals/context/context";

let context: ServeContext;

initializeConfig()
	.then(initializeContext)
	.then(listen)
	.catch((error: any) => {
		Winston.error(error);
	});

async function initializeConfig(): Promise<void> {
	dotenv.config();
}

async function initializeContext(): Promise<void> {
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
	context.set("configuration:helmet", {});

	// If you need GraphQL subscriptions set this to true
	context.set("configuration:graphql:subscription", true);
	// If no value is set, it defaults to 4000
	context.set("configuration:graphql:ws:port", 5000);
}

async function listen(): Promise<void> {
	const makeListeners = buildMakeListeners({ Logger: Winston });
	const listeners: Listener = makeListeners(context);

	await listeners.initialize();
	await listeners.listen();
}
