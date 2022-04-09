import { ServeContext } from "../../../context/context";
import { ThunkObjMap, GraphQLFieldConfig } from "graphql";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";
import { getApiRouteFolderName } from "../../../routes/utilities";
import findSourceDirectory from "../../../directory/directory";
import Winston from "../../../logger/logger";
import CliColors from "../../../colors/colors";

export default async function useMutations(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
): Promise<GraphQLField> {
	let mutations: GraphQLField = Object.create(null);

	try {
		const apiRouteFolder = getApiRouteFolderName(context);
		const sourceDirectory = await findSourceDirectory();
		const rootDirectory = resolve(
			sourceDirectory,
			`./external/routes/${apiRouteFolder}/mutations`,
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
	} catch (error: any) {
		Winston.error(CliColors.red("Unable to load GraphQL mutations"));
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
