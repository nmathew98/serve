import consola from "consola";
import { resolve } from "path";
import { IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "../listeners/context/context";
import findRootDirectory from "./find-root-directory";
import isJavaScript from "./is-javascript";
import isPathValid from "./is-path-valid";
import ls from "./ls";
import { GraphQLFieldResolver } from "graphql";

export default function useGqlSchemaDefinitions(directory: string) {
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

							const schemaDefinition = useDefinition(
								context,
								request,
								response,
							);

							if (isGraphQLSchemaDefinition(schemaDefinition))
								definitions.push(schemaDefinition);
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

/**
 * A definition for a type in the schema
 */
export interface GraphQLSchemaDefinition {
	/**
	 * The definition for the field
	 *
	 * Can be gql tagged or just a plain string
	 *
	 * For example:
	 * `createUser(name: String!): User!`
	 */
	definition?: string;
	/**
	 * Any types required for the field definition
	 *
	 * Can be gql tagged or just a plain string
	 *
	 * For example:
	 * ```
	 * type User {
	 * 	firstName: String!
	 * 	lastName: String!
	 * }
	 * ```
	 */
	types?: string;
	/**
	 * The resolver for the field
	 *
	 * For example:
	 * ```
	 * {
	 * 	createUser: (_, { name }: { name: string}) => {
	 *			const split = name.split(" ");
	 *
	 *			return {
	 *				firstName: split[0],
	 *				lastName: split[1]
	 *			}
	 * 	}
	 * }
	 * ```
	 */
	resolve?: GraphQLResolver;
}

export type GraphQLSchemaHandler = (
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) => GraphQLSchemaDefinition;

type GraphQLResolver = {
	[key: string]: GraphQLFieldResolver<any, any> | DirectiveResolver;
};

type DirectiveResolver = (directiveName: string) => Promise<any>;

function isGraphQLSchemaDefinition(o: any): o is GraphQLSchemaDefinition {
	if (typeof o !== "object") return false;

	if (o.definition) if (typeof o.definition !== "string") return false;

	if (o.types) if (typeof o.types !== "string") return false;

	if (o.resolve) {
		if (Object.keys(o.resolve).length > 1) return false;

		if (
			Object.keys(o.resolve).some(key => typeof o.resolve[key] !== "function")
		)
			return false;
	}

	return true;
}
