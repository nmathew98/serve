import { ServeContext } from "../../../listeners/context/context";
import { IncomingMessage, ServerResponse } from "h3";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLSchema } from "graphql";
import useGqlSchemaDefinitions, {
	GraphQLSchemaDefinition,
} from "../../../composables/use-gql-schema-definitions";

let schema: GraphQLSchema;
const useQueries = useGqlSchemaDefinitions("./external/routes/api/queries");
const useMutations = useGqlSchemaDefinitions("./external/routes/api/mutations");
const useSubscriptions = useGqlSchemaDefinitions(
	"./external/routes/api/subscriptions",
);
const useTypes = useGqlSchemaDefinitions("./external/routes/api/types");

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

	const hasDefinitions = aggregated.some(handler => !!handler.definition);

	const types = aggregated
		.filter(handler => !!handler.types)
		.map(handler => handler.types)
		.join("\n");

	if (!root) return { types };

	let fields = "";
	if (hasDefinitions)
		fields = [
			`type ${root} {`,
			aggregated
				.filter(handler => !!handler.definition)
				.map(handler => `\t${handler.definition}`)
				.join("\n"),
			`}`,
		].join("\n");

	let resolvers = Object.create(null);
	if (hasDefinitions)
		resolvers = {
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
