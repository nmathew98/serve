import { ServeContext } from "$internals/context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "http";
import { resolve } from "path/posix";
import { Dirent as DirectoryEntry } from "fs";
import { readdir } from "fs/promises";

export default async function useMutations(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let mutations: GraphQLField = Object.create(null);

	const rootDirectory = resolve(__dirname);
	const files: DirectoryEntry[] = await readdir(rootDirectory, {
		withFileTypes: true,
	});
	const folders: string[] = files
		.filter((file: DirectoryEntry) => file.isDirectory())
		.map((directory: DirectoryEntry) => directory.name);

	for (const folder of folders) {
		const mutationPath: string = resolve(__dirname, folder, `${folder}.ts`);

		const mutationImport = await import(mutationPath);
		const mutationHandler: GraphQLMutationHandler = mutationImport.default;

		mutations = {
			...mutations,
			...mutationHandler(request, response, context),
		};
	}

	return mutations;
}

type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
type GraphQLMutationHandler = (
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) => GraphQLField;
