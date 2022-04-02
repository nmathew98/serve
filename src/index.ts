import "module-alias/register";
import Winston, { Logger } from "$internals/logger/logger";
import dotenv from "dotenv";
import buildMakeListenerFactory, {
	ListenerFactory,
	Listener,
} from "$internals/listeners/listener-factory";
import { makeContext, ServeContext } from "$internals/context/context";

let logger: Logger;
let context: ServeContext;

initializeConfig()
	.then(initializeContext)
	.then(listen)
	.catch((error: any) => {
		logger.error(error);
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
}

async function listen(): Promise<void> {
	const makeListenerFactory = buildMakeListenerFactory({ Logger: Winston });
	let listenerFactory: ListenerFactory = makeListenerFactory(context);
	const listeners: Listener[] = await listenerFactory.getListeners();

	for (let i = 0; i < listeners.length; i++) {
		await listeners[i]?.initialize();
		await listeners[i]?.listen();
	}
}
