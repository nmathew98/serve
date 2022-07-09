import { ServeContext } from "../../../listeners/context/context";
import { IncomingMessage, ServerResponse } from "h3";
import { makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import useGqlSchemaDefinition, {
	GraphQLSchemaDefinition,
} from "../../../composables/use-gql-schema-definition";

let schema: GraphQLSchema;
const useQueries = useGqlSchemaDefinition("./external/routes/api/queries");
const useMutations = useGqlSchemaDefinition("./external/routes/api/mutations");
const useSubscriptions = useGqlSchemaDefinition(
	"./external/routes/api/subscriptions",
);
const useTypes = useGqlSchemaDefinition("./external/routes/api/types");

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

type GraphQLSchemaHandlerAggregator = (
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) => Promise<GraphQLSchemaDefinition[]>;
