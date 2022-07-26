import type { GraphQLFieldResolver } from "graphql";

import { schemaDefinitionStore, useStore } from "../../utilities/store";

export const defineSchemaDefinition =
	(definition: Partial<GraphQLSchemaDefinition>) => async () =>
		Object.freeze(definition);

export const defineQuery = (definition: GraphQLQueryDefinition) => async () => {
	const [queries, setQueries] = useStore("queries", schemaDefinitionStore);

	const updated = [];
	if (queries) updated.push(...queries);
	updated.push(defineSchemaDefinition(definition));

	setQueries(updated);
};

export const defineMutation =
	(definition: GraphQLMutationDefinition) => async () => {
		const [mutations, setMutations] = useStore(
			"mutations",
			schemaDefinitionStore,
		);

		const updated = [];
		if (mutations) updated.push(...mutations);
		updated.push(defineSchemaDefinition(definition));

		setMutations(updated);
	};

export const defineType = (definition: GraphQLTypeDefinition) => async () => {
	const [types, setTypes] = useStore("types", schemaDefinitionStore);

	const updated = [];
	if (types) updated.push(...types);
	updated.push(defineSchemaDefinition(definition));

	setTypes(updated);
};

export const defineDirective =
	(definition: GraphQLDirectiveDefinition) => async () => {
		const [directives, setDirectives] = useStore(
			"directives",
			schemaDefinitionStore,
		);

		const updated = [];
		if (directives) updated.push(...directives);
		updated.push(defineSchemaDefinition(definition));

		setDirectives(directives);
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
