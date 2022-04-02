import { GraphQLInterfaceType } from "graphql";
import { resolve } from "path/posix";
import { readdir } from "fs/promises";

export default async function useTypes(): Promise<GraphQLInterfaceType[]> {
	const types: GraphQLInterfaceType[] = [];

	const rootDirectory = resolve(__dirname);
	const files = await readdir(rootDirectory, {
		withFileTypes: true,
	});
	const folders: string[] = files
		.filter(file => file.isDirectory())
		.map(directory => directory.name);

	for (const folder of folders) {
		const typePath = resolve(__dirname, folder, `${folder}.ts`);

		const typeImport = await import(typePath);
		const useType: GraphQLTypeHandler = typeImport.default;

		const importedTypes = useType();

		if (Array.isArray(importedTypes)) types.push(...importedTypes);
		else types.push(importedTypes);
	}

	return types;
}

type GraphQLTypeHandler = () => GraphQLInterfaceType | GraphQLInterfaceType[];
