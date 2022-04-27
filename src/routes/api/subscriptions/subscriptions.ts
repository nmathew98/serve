import { ServeContext } from "../../../context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";
import { getApiRouteFolderName } from "../../utilities";
import { findOutputDirectory } from "../../../directory/directory";
import Winston from "../../../logger/logger";
import CliColors from "../../../colors/colors";

export default async function useSubscription(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let subscriptions: GraphQLField = Object.create(null);

	try {
		const apiRouteFolder = getApiRouteFolderName(context);
		const sourceDirectory = await findOutputDirectory();
		const rootDirectory = resolve(
			sourceDirectory,
			`./external/routes/${apiRouteFolder}/subscriptions`,
		);
		const files = await readdir(rootDirectory, {
			withFileTypes: true,
		});
		const folders = files
			.filter(file => file.isDirectory())
			.map(directory => directory.name);

		for (const folder of folders) {
			const subscriptionPath = resolve(rootDirectory, folder, folder);

			const { default: useSubscription }: GraphQLSubscriptionImport =
				await import(subscriptionPath);

			subscriptions = {
				...subscriptions,
				...useSubscription(context, request, response),
			};
		}
	} catch (error: any) {
		Winston.error(CliColors.red("Unable to load GraphQL subscriptions"));
	}

	return subscriptions;
}

type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
type GraphQLSubscriptionImport = { default: GraphQLSubscriptionHandler };
type GraphQLSubscriptionHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLField;
