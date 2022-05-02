import { ServeContext } from "../../../listeners/context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path/posix";
import Consola from "../../../adapters/logger/logger";
import findRootDirectory from "../../../composables/find-root-directory";
import ls from "../../../composables/ls";
import isJavaScript from "../../../composables/is-javascript";

export default async function useMutations(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let mutations: GraphQLField = Object.create(null);

	try {
		const rootDirectory = await findRootDirectory();
		const mutationsDirectory = resolve(
			rootDirectory,
			"./dist",
			"./external/routes/api/mutations",
		);

		for await (const file of ls(mutationsDirectory)) {
			if (isJavaScript(file)) {
				const imported = await import(file);

				if (imported.default && typeof imported.default === "function") {
					const useMutation: GraphQLMutationHandler = imported.default;

					mutations = {
						...mutations,
						...useMutation(context, request, response),
					};
				}
			}
		}
	} catch (error: any) {
		Consola.error("Unable to load GraphQL mutations");
	}

	return mutations;
}

export type GraphQLMutationHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLField;
type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
