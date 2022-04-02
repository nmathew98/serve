import { ServeContext } from "$internals/context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "http";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";

export default async function useQueries(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let queries: GraphQLField = Object.create(null);

	const rootDirectory = resolve(__dirname);
	const files = await readdir(rootDirectory, {
		withFileTypes: true,
	});
	const folders = files
		.filter(file => file.isDirectory())
		.map(directory => directory.name);

	for (const folder of folders) {
		const queryPath = resolve(__dirname, folder, `${folder}.ts`);

		const queryImport = await import(queryPath);
		const useQuery: GraphQLQueryHandler = queryImport.default;

		queries = {
			...queries,
			...useQuery(context, request, response),
		};
	}

	return queries;
}

type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
type GraphQLQueryHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLField;
