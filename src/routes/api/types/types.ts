import { GraphQLInterfaceType } from "graphql";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";
import { getApiRouteFolderName } from "../../../routes/utilities";
import { ServeContext } from "../../../listeners/context/context";
import { findOutputDirectory } from "../../../utilities/directory/directory";
import Winston from "../../../adapters/logger/logger";
import CliColors from "../../../adapters/colors/colors";

export default async function useTypes(
	context: ServeContext,
): Promise<GraphQLInterfaceType[]> {
	const types: GraphQLInterfaceType[] = [];

	try {
		const apiRouteFolder = getApiRouteFolderName(context);
		const sourceDirectory = await findOutputDirectory();
		const rootDirectory = resolve(
			sourceDirectory,
			`./external/routes/${apiRouteFolder}/types`,
		);
		const files = await readdir(rootDirectory, {
			withFileTypes: true,
		});
		const folders: string[] = files
			.filter(file => file.isDirectory())
			.map(directory => directory.name);

		for (const folder of folders) {
			const typePath = resolve(rootDirectory, folder, folder);

			const { default: useType }: GraphQLTypeImport = await import(typePath);
			const importedTypes = useType();

			if (Array.isArray(importedTypes)) types.push(...importedTypes);
			else types.push(importedTypes);
		}
	} catch (error: any) {
		Winston.error(CliColors.red("Unable to load GraphQL types"));
	}

	return types;
}

export type GraphQLTypeHandler = () =>
	| GraphQLInterfaceType
	| GraphQLInterfaceType[];
type GraphQLTypeImport = { default: GraphQLTypeHandler };
