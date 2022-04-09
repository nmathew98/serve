import { GraphQLInterfaceType } from "graphql";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";
import { getApiRouteFolderName } from "$internals/routes/utilities";
import { ServeContext } from "$internals/context/context";

export default async function useTypes(
	context: ServeContext,
): Promise<GraphQLInterfaceType[]> {
	const types: GraphQLInterfaceType[] = [];

	const apiRouteFolder = getApiRouteFolderName(context);
	const rootDirectory = resolve(
		__dirname,
		`../../../../external/routes/${apiRouteFolder}/types`,
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

	return types;
}

type GraphQLTypeImport = { default: GraphQLTypeHandler };
type GraphQLTypeHandler = () => GraphQLInterfaceType | GraphQLInterfaceType[];
