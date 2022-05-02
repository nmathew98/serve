import { GraphQLInterfaceType } from "graphql";
import { resolve } from "path/posix";
import Consola from "../../../adapters/logger/logger";
import findRootDirectory from "../../../composables/find-root-directory";
import ls from "../../../composables/ls";
import isJavaScript from "../../../composables/is-javascript";

export default async function useTypes(): Promise<GraphQLInterfaceType[]> {
	const types: GraphQLInterfaceType[] = [];

	try {
		const rootDirectory = await findRootDirectory();
		const subscriptionsDirectory = resolve(
			rootDirectory,
			"./external/routes/api/queries",
		);

		for await (const file of ls(subscriptionsDirectory)) {
			if (isJavaScript(file)) {
				const imported = await import(file);

				if (imported.default && typeof imported.default === "function") {
					const useType: GraphQLTypeHandler = imported.default;
					const importedTypes = useType();

					if (Array.isArray(importedTypes)) types.push(...importedTypes);
					else types.push(importedTypes);
				}
			}
		}
	} catch (error: any) {
		Consola.error("Unable to load GraphQL subscriptions");
	}

	return types;
}

export type GraphQLTypeHandler = () =>
	| GraphQLInterfaceType
	| GraphQLInterfaceType[];
