import { ServeContext } from "$internals/context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "http";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";

export default async function useSubscription(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let subscriptions: GraphQLField = Object.create(null);

	const rootDirectory = resolve(__dirname);
	const files = await readdir(rootDirectory, {
		withFileTypes: true,
	});
	const folders = files
		.filter(file => file.isDirectory())
		.map(directory => directory.name)
		.filter(directory => directory !== "websocket");

	for (const folder of folders) {
		const subscriptionPath = resolve(__dirname, folder, `${folder}.ts`);

		const subscriptionImport = await import(subscriptionPath);
		const useSubscription: GraphQLSubscriptionHandler =
			subscriptionImport.default;

		subscriptions = {
			...subscriptions,
			...useSubscription(context, request, response),
		};
	}

	return subscriptions;
}

type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
type GraphQLSubscriptionHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLField;
