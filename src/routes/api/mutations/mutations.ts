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

export default async function useMutations(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLSchemaDefinition[]> {
	const mutations: GraphQLSchemaDefinition[] = [];

	try {
		const rootDirectory = await findRootDirectory();
		const mutationsDirectory = resolve(
			rootDirectory,
			"./dist",
			"./external/routes/api/mutations",
		);

		if (await isPathValid(mutationsDirectory)) {
			for await (const file of ls(mutationsDirectory)) {
				if (isJavaScript(file)) {
					const imported = await import(file);

					if (imported.default && typeof imported.default === "function") {
						const useMutation: GraphQLSchemaHandler = imported.default;

						const mutation = useMutation(context, request, response);

						if (isGraphQLSchemaDefinition(mutation)) mutations.push(mutation);
					}
				}
			}
		}
	} catch (error: any) {
		Consola.error("Unable to load GraphQL mutations");
	}

	return mutations;
}
