import consola from "consola";
import { resolve } from "path";
import { IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "../listeners/context/context";
import findRootDirectory from "./find-root-directory";
import isJavaScript from "./is-javascript";
import isPathValid from "./is-path-valid";
import ls from "./ls";

export default function useGqlSchemaDefinition(directory: string) {
	return async (
		request: IncomingMessage,
		response: ServerResponse,
		context: ServeContext,
	) => {
		const definitions: GraphQLSchemaDefinition[] = [];

		try {
			const rootDirectory = await findRootDirectory();
			const definitionsDirectory = resolve(rootDirectory, "./dist", directory);

			if (await isPathValid(definitionsDirectory)) {
				for await (const file of ls(definitionsDirectory)) {
					if (isJavaScript(file)) {
						const imported = await import(file);

						if (imported.default && typeof imported.default === "function") {
							const useDefinition: GraphQLSchemaHandler = imported.default;

							const definition = useDefinition(context, request, response);

							if (isGraphQLSchemaDefinition(definition))
								definitions.push(definition);
						}
					}
				}
			}
		} catch (error: any) {
			consola.error(`Unable to load GraphQL definitions from ${directory}`);
		}

		return definitions;
	};
}

export interface GraphQLSchemaDefinition {
	definition?: string;
	types?: string;
	resolve?: { [key: string]: AnyFunction };
}

export type GraphQLSchemaHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLSchemaDefinition;

type AnyFunction = (...args: any[]) => any;

function isGraphQLSchemaDefinition(o: any): o is GraphQLSchemaDefinition {
	if (typeof o !== "object") return false;

	if (!o.types) return false;

	if (o.definition) if (typeof o.definition !== "string") return false;

	if (o.types) if (typeof o.types !== "string") return false;

	if (o.resolve) if (typeof o.resolve !== "function") return false;

	if (o.resolvers) if (!Array.isArray(o.resolvers)) return false;

	return true;
}
