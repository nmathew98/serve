import { ServeContext } from "../../../listeners/context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path/posix";
import Consola from "../../../adapters/logger/logger";
import findRootDirectory from "../../../composables/find-root-directory";
import ls from "../../../composables/ls";
import isJavaScript from "../../../composables/is-javascript";

export default async function useSubscription(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let subscriptions: GraphQLField = Object.create(null);

	try {
		const rootDirectory = await findRootDirectory();
		const subscriptionsDirectory = resolve(
			rootDirectory,
			"./external/routes/api/queries",
		);

		for await (const file of ls(subscriptionsDirectory)) {
			if (isJavaScript(file)) {
				const imported = await import(file);

				if (imported.default && typeof imported.default === "function") {
					const useSubscription: GraphQLSubscriptionHandler = imported.default;

					subscriptions = {
						...subscriptions,
						...useSubscription(context, request, response),
					};
				}
			}
		}
	} catch (error: any) {
		Consola.error("Unable to load GraphQL subscriptions");
	}

	return subscriptions;
}

export type GraphQLSubscriptionHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLField;
type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
