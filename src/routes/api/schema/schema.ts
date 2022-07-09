import { ServeContext } from "../../../listeners/context/context";
import useSubscriptions from "../subscriptions/subscriptions";
import { IncomingMessage, ServerResponse } from "h3";
import useQueries from "../queries/queries";
import useMutations from "../mutations/mutations";
import useTypes from "../types/types";
import {
	GraphQLSchemaDefinition,
	GraphQLSchemaHandlerAggregator,
} from "../api";
import { makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";

let schema: GraphQLSchema;

export default async function useSchema(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	if (schema) return schema;

	const collate = async (
		aggregator: GraphQLSchemaHandlerAggregator,
		root?: string,
	) =>
		await collateDefinitions({ root, request, response, context, aggregator });

	const schemaDefinitions = [
		await collate(useTypes),
		await collate(useQueries, "Query"),
		await collate(useMutations, "Mutation"),
		await collate(useSubscriptions, "Subscription"),
	];

	const configuration = {
		typeDefs: schemaDefinitions.map(definition => definition.types).join("\n"),
		resolvers: schemaDefinitions.reduce(
			(accumulator, definition) => ({
				...accumulator,
				...definition.resolve,
			}),
			Object.create(null),
		),
	};

	schema = makeExecutableSchema(configuration);

	return schema;
}

async function collateDefinitions({
	root,
	request,
	response,
	context,
	aggregator,
}: CollateDefinitionsArguments): Promise<GraphQLSchemaDefinition> {
	const aggregated = await aggregator(request, response, context);

	const types = aggregated
		.filter(handler => !!handler.types)
		.map(handler => handler.types)
		.join("\n");

	if (!root) return { types };

	const fields = [
		`type ${root} {`,
		aggregated
			.filter(handler => !!handler.definition)
			.map(handler => handler.definition)
			.join("\t"),
		`}`,
	].join("\n");

	const resolvers = {
		[root]: aggregated
			.filter(handler => !!handler.resolve)
			.reduce(
				(accumulator, handler) => ({
					...accumulator,
					...handler.resolve,
				}),
				Object.create(null),
			),
	};

	return {
		types: [types, fields].join("\n"),
		resolve: resolvers,
	};
}

interface CollateDefinitionsArguments {
	root?: string;
	request: IncomingMessage;
	response: ServerResponse;
	context: ServeContext;
	aggregator: GraphQLSchemaHandlerAggregator;
}
