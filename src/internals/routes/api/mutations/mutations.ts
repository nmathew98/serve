import { ServeContext } from "$internals/context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";
import { getApiRouteFolderName } from "$internals/routes/utilities";

export default async function useMutations(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let mutations: GraphQLField = Object.create(null);

	const apiRouteFolder = getApiRouteFolderName(context);
	const rootDirectory = resolve(
		__dirname,
		`../../../../external/routes/${apiRouteFolder}/mutations`,
	);
	const files = await readdir(rootDirectory, {
		withFileTypes: true,
	});
	const folders = files
		.filter(file => file.isDirectory())
		.map(directory => directory.name);

	for (const folder of folders) {
		const mutationPath = resolve(rootDirectory, folder, folder);

		const { default: useMutation }: GraphQLMutationImport = await import(
			mutationPath
		);

		mutations = {
			...mutations,
			...useMutation(context, request, response),
		};
	}

	return mutations;
}

type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
type GraphQLMutationImport = { default: GraphQLMutationHandler };
type GraphQLMutationHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLField;
