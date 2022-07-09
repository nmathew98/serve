import { ServeContext } from "../../../listeners/context/context";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path/posix";
import Consola from "../../../adapters/logger/logger";
import findRootDirectory from "../../../composables/find-root-directory";
import ls from "../../../composables/ls";
import isJavaScript from "../../../composables/is-javascript";
import isPathValid from "../../../composables/is-path-valid";
import {
	GraphQLSchemaDefinition,
	GraphQLSchemaHandler,
	isGraphQLSchemaDefinition,
} from "../api";

export default async function useSubscriptions(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLSchemaDefinition[]> {
	const subscriptions: GraphQLSchemaDefinition[] = [];

	try {
		const rootDirectory = await findRootDirectory();
		const subscriptionsDirectory = resolve(
			rootDirectory,
			"./dist",
			"./external/routes/api/subscriptions",
		);

		if (await isPathValid(subscriptionsDirectory)) {
			for await (const file of ls(subscriptionsDirectory)) {
				if (isJavaScript(file)) {
					const imported = await import(file);

					if (imported.default && typeof imported.default === "function") {
						const useSubscription: GraphQLSchemaHandler = imported.default;

						const subscription = useSubscription(context, request, response);

						if (isGraphQLSchemaDefinition(subscription))
							subscriptions.push(subscription);
					}
				}
			}
		}
	} catch (error: any) {
		Consola.error("Unable to load GraphQL subscriptions");
	}

	return subscriptions;
}
