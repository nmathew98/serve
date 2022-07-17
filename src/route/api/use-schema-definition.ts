import { makeExecutableSchema } from "@graphql-tools/schema";
// @ts-expect-error: This is a virtual module
import * as defs from "#schemaDefs";

import type { GraphQLSchemaDefinition } from "./define-schema-definition";
import { Logger } from "../../adapter/internal/logger/logger";
import { schemaDefinitionStore, useStore } from "../../utilities/store";

export const useSchema = async () => {
	const [schema, setSchema] = useStore("schema");

	if (schema) return schema;

	await loadSchemaDefs();

	const schemaDefinitions = [
		collateFields(),
		collateFields("Query"),
		collateFields("Mutation"),
		collateFields("Subscription"),
	];

	const directives = collateDirectives();

	const configuration = {
		typeDefs: schemaDefinitions.map(schemaDef => schemaDef.types).join("\n"),
		resolvers: schemaDefinitions.reduce(
			(accumulator, schemaDef) => ({
				...accumulator,
				...schemaDef.resolve,
			}),
			Object.create(null),
		),
	};
	{
		// For reference on how directives should be defined
		// https://www.graphql-tools.com/docs/schema-directives
		const schema = Object.keys(directives).reduce(
			(updated, directive) => directives[directive](updated),
			makeExecutableSchema(configuration),
		);

		setSchema(schema);
	}

	clearSchemaDefinitions();

	return schema;
};

const loadSchemaDefs = async () => {
	// Not 100% sure if this (the imports) will get shaken out
	// I think not as we are importing everything
	await Promise.all(
		Object.keys(defs)
			.filter(def => def.includes("SCHEMADEF_"))
			.map(async def => await defs[def]()),
	);
};

const clearSchemaDefinitions = () => {
	schemaDefinitionStore.clear();
};

const collateDirectives = () => {
	const isPromise = (o: any): o is Promise<any> =>
		typeof o === "object" && !!o.then && typeof o.then === "function";

	const [schemaDefs] =
		useStore<Partial<GraphQLSchemaDefinition>[]>("directives");

	if (!schemaDefs) return;

	const hasDefinitions = schemaDefs.every(schemaDef => !!schemaDef.definition);
	const hasResolver = schemaDefs.every(
		schemaDef => !!schemaDef.resolve && typeof schemaDef.resolve === "function",
	);
	const hasPromises = schemaDefs
		.filter(schemaDef => !!schemaDef.resolve)
		.some(schemaDef => isPromise(schemaDef.resolve));

	if (!hasDefinitions)
		return Logger.error(
			"Every directive must provide its name in the definition",
		);

	if (!hasResolver)
		return Logger.error("Every directive must provide a resolver");

	if (hasPromises)
		return Logger.error("Directive resolvers cannot return Promises");

	return schemaDefs.reduce(
		(accumulator, schemaDef) => ({
			...accumulator,
			[schemaDef.definition as string]: (
				schemaDef.resolve as unknown as () => any
			)(),
		}),
		Object.create(null),
	);
};

const collateFields = (root?: string) => {
	const [schemaDefs] = useStore<Partial<GraphQLSchemaDefinition>[]>(
		root || "types",
	);

	const hasDefinitions = schemaDefs.some(schemaDef => !!schemaDef.definition);

	const types = schemaDefs
		.filter(schemaDef => !!schemaDef.types)
		.map(schemaDef => schemaDef.types)
		.join("\n");

	if (!root) return { types };

	let fields = "";
	if (hasDefinitions)
		fields = [
			`type ${root} {`,
			schemaDefs
				.filter(schemaDef => !!schemaDef.definition)
				.map(schemaDef => `\t${schemaDef.definition}`)
				.join("\n"),
			"}",
		].join("\n");

	let resolvers = Object.create(null);
	if (hasDefinitions)
		resolvers = {
			[root]: schemaDefs
				.filter(schemaDef => !!schemaDef.resolve)
				.reduce(
					(accumulator, schemaDef) => ({
						...accumulator,
						...schemaDef.resolve,
					}),
					Object.create(null),
				),
		};

	return {
		types: [types, fields].join("\n"),
		resolve: resolvers,
	};
};
