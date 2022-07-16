import type { GraphQLFieldResolver } from "graphql";

import { schemaDefinitionStore, useStore } from "../../utilities/store";

export const defineSchemaDefinition = (
	definition: Partial<GraphQLSchemaDefinition>,
) => Object.freeze(definition);

export const defineQuery = (definition: GraphQLQueryDefinition) => {
	let queries = useStore("queries", schemaDefinitionStore);

	if (!queries) queries = [];

	queries.push(defineSchemaDefinition(definition));
};

export const defineMutation = (definition: GraphQLMutationDefinition) => {
	let mutations = useStore("mutations", schemaDefinitionStore);

	if (!mutations) mutations = [];

	mutations.push(defineSchemaDefinition(definition));
};

export const defineType = (definition: GraphQLTypeDefinition) => {
	let types = useStore("types", schemaDefinitionStore);

	if (!types) types = [];

	types.push(defineSchemaDefinition(definition));
};

export const defineDirective = (definition: GraphQLDirectiveDefinition) => {
	let directives = useStore("directives", schemaDefinitionStore);

	if (!directives) directives = [];

	directives.push(defineSchemaDefinition(definition));
};

export interface GraphQLSchemaDefinition {
	definition: string;
	types: string;
	resolve: GraphQLFieldResolver<any, any> | (() => any);
}

type GraphQLQueryDefinition = Omit<GraphQLSchemaDefinition, "types"> &
	Partial<Pick<GraphQLSchemaDefinition, "types">>;
type GraphQLMutationDefinition = Omit<GraphQLSchemaDefinition, "types"> &
	Partial<Pick<GraphQLSchemaDefinition, "types">>;
type GraphQLDirectiveDefinition = Omit<GraphQLSchemaDefinition, "definition">;
type GraphQLTypeDefinition = Pick<GraphQLSchemaDefinition, "types">;
