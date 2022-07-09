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

export default async function useQueries(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLSchemaDefinition[]> {
	const queries: GraphQLSchemaDefinition[] = [];

	try {
		const rootDirectory = await findRootDirectory();
		const queriesDirectory = resolve(
			rootDirectory,
			"./dist",
			"./external/routes/api/queries",
		);

		if (await isPathValid(queriesDirectory)) {
			for await (const file of ls(queriesDirectory)) {
				if (isJavaScript(file)) {
					const imported = await import(file);

					if (imported.default && typeof imported.default === "function") {
						const useQuery: GraphQLSchemaHandler = imported.default;

						const query = useQuery(context, request, response);

						if (isGraphQLSchemaDefinition(query))
							queries.push(useQuery(context, request, response));
					}
				}
			}
		}
	} catch (error: any) {
		Consola.error("Unable to load GraphQL queries");
	}

	return queries;
}
