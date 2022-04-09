import "module-alias/register";
import dotenv from "dotenv";
import {
	initialize,
	setProjectConfiguration,
	setServeConfiguration,
	setEntityConfiguration,
	ServeContext,
	GetAuthorization,
	VerifyAuthorization,
} from "@skulpture/serve";

initializeProjectConfiguration()
	.then(initializeServeConfiguration)
	.then(initializeEntityConfiguration)
	.then(listen);

async function initializeProjectConfiguration() {
	setProjectConfiguration(async () => {
		dotenv.config();
	});
}

async function initializeServeConfiguration() {
	setServeConfiguration(async (context: ServeContext) => {
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
		context.set(
			"configuration:routes:authorization:verify",
			verifyAuthorization,
		);

		// The value must conform to the GetAuthroization type
		// Import it from `$internals/routes/utilities`
		// Throw a RouteError if error
		const getAuthorization: GetAuthorization = Object.create(null);
		context.set("configuration:routes:authorization:get", getAuthorization);

		// If route access is restricted, set the options for the API route
		// to pass to verifyAuthorization here
		context.set("configuration:routes:api:verify", Object.create(null));
	});
}

async function initializeEntityConfiguration() {
	setEntityConfiguration(async (context: ServeContext) => {
		// Set the entity configuration here
		context.set("configuration:entity:Example", Object.create(null));
	});
}

async function listen() {
	await initialize();
}
