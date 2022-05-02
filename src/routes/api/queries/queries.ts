import { ServeContext } from "../../../listeners/context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path/posix";
import Consola from "../../../adapters/logger/logger";
import findRootDirectory from "../../../composables/find-root-directory";
import ls from "../../../composables/ls";
import isJavaScript from "../../../composables/is-javascript";

export default async function useQueries(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let queries: GraphQLField = Object.create(null);

	try {
		const rootDirectory = await findRootDirectory();
		const queriesDirectory = resolve(
			rootDirectory,
			"./external/routes/api/queries",
		);

		for await (const file of ls(queriesDirectory)) {
			if (isJavaScript(file)) {
				const imported = await import(file);

				if (imported.default && typeof imported.default === "function") {
					const useMutation: GraphQLQueryHandler = imported.default;

					queries = {
						...queries,
						...useMutation(context, request, response),
					};
				}
			}
		}
	} catch (error: any) {
		Consola.error("Unable to load GraphQL queries");
	}

	return queries;
}

export type GraphQLQueryHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLField;
type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
