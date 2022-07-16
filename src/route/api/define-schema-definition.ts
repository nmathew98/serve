import type { GraphQLFieldResolver } from "graphql";

import { schemaDefinitionStore, useStore } from "../../utilities/store";

export const defineSchemaDefinition = (
	definition: Partial<GraphQLSchemaDefinition>,
) => Object.freeze(definition);

export const defineQuery = (definition: GraphQLQueryDefinition) => {
	const [, setQueries] = useStore("queries", schemaDefinitionStore);

	setQueries([defineSchemaDefinition(definition)]);
};

export const defineMutation = (definition: GraphQLMutationDefinition) => {
	const [, setMutations] = useStore("mutations", schemaDefinitionStore);

	setMutations([defineSchemaDefinition(definition)]);
};

export const defineType = (definition: GraphQLTypeDefinition) => {
	const [, setTypes] = useStore("types", schemaDefinitionStore);

	setTypes([defineSchemaDefinition(definition)]);
};

export const defineDirective = (definition: GraphQLDirectiveDefinition) => {
	const [, setDirectives] = useStore("directives", schemaDefinitionStore);

	setDirectives([defineSchemaDefinition(definition)]);
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
