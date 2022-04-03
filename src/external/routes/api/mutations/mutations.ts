import { ServeContext } from "$internals/context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "http";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";

export default async function useMutations(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let mutations: GraphQLField = Object.create(null);

	const rootDirectory = resolve(__dirname);
	const files = await readdir(rootDirectory, {
		withFileTypes: true,
	});
	const folders = files
		.filter(file => file.isDirectory())
		.map(directory => directory.name);

	for (const folder of folders) {
		const mutationPath = resolve(__dirname, folder, `${folder}.ts`);

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
