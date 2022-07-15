import { GraphQLFieldResolver } from "graphql";
import { schemaDefinitionStore, useStore } from "../../utilities/store";

export const defineSchemaDefinition = (
	definition: Partial<GraphQLSchemaDefinition>,
) => Object.freeze(definition);

export const defineQuery = (
	definition: Omit<GraphQLSchemaDefinition, "types"> &
		Partial<Pick<GraphQLSchemaDefinition, "types">>,
) => {
	let queries = useStore("queries", schemaDefinitionStore);

	if (!queries) queries = [];

	queries.push(defineSchemaDefinition(definition));
};

export const defineMutation = (
	definition: Omit<GraphQLSchemaDefinition, "types"> &
		Partial<Pick<GraphQLSchemaDefinition, "types">>,
) => {
	let mutations = useStore("mutations", schemaDefinitionStore);

	if (!mutations) mutations = [];

	mutations.push(defineSchemaDefinition(definition));
};

export const defineType = (
	definition: Pick<GraphQLSchemaDefinition, "types">,
) => {
	let types = useStore("types", schemaDefinitionStore);

	if (!types) types = [];

	types.push(defineSchemaDefinition(definition));
};

export const defineDirective = (
	definition: Omit<GraphQLSchemaDefinition, "definition">,
) => {
	let directives = useStore("directives", schemaDefinitionStore);

	if (!directives) directives = [];

	directives.push(defineSchemaDefinition(definition));
};

export const clearSchemaDefinitions = () => {
	schemaDefinitionStore.clear();
};

export interface GraphQLSchemaDefinition {
	definition: string;
	types: string;
	resolve: GraphQLFieldResolver<any, any> | (() => any);
}
