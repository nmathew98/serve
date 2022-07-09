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
import { IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "../../../listeners/context/context";

export default async function useTypes(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLSchemaDefinition[]> {
	const types: GraphQLSchemaDefinition[] = [];

	try {
		const rootDirectory = await findRootDirectory();
		const typesDirectory = resolve(
			rootDirectory,
			"./dist",
			"./external/routes/api/types",
		);

		if (await isPathValid(typesDirectory)) {
			for await (const file of ls(typesDirectory)) {
				if (isJavaScript(file)) {
					const imported = await import(file);

					if (imported.default && typeof imported.default === "function") {
						const useType: GraphQLSchemaHandler = imported.default;

						const type = useType(context, request, response);

						if (isGraphQLSchemaDefinition(type)) types.push(type);
					}
				}
			}
		}
	} catch (error: any) {
		Consola.error("Unable to load GraphQL types");
	}

	return types;
}
