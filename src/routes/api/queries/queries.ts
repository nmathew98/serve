import { ServeContext } from "../../../context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";
import { getApiRouteFolderName } from "../../../routes/utilities";
import findSourceDirectory from "../../../directory/directory";

export default async function useQueries(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let queries: GraphQLField = Object.create(null);

	const apiRouteFolder = getApiRouteFolderName(context);
	const sourceDirectory = await findSourceDirectory();
	const rootDirectory = resolve(
		sourceDirectory,
		`./external/routes/${apiRouteFolder}/queries`,
	);
	const files = await readdir(rootDirectory, {
		withFileTypes: true,
	});
	const folders = files
		.filter(file => file.isDirectory())
		.map(directory => directory.name);

	for (const folder of folders) {
		const queryPath = resolve(rootDirectory, folder, folder);

		const { default: useQuery }: GraphQLQueryImport = await import(queryPath);

		queries = {
			...queries,
			...useQuery(context, request, response),
		};
	}

	return queries;
}

type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
type GraphQLQueryImport = { default: GraphQLQueryHandler };
type GraphQLQueryHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLField;
