import { ServeContext } from "../../../listeners/context/context";
import { IncomingMessage, ServerResponse } from "h3";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLSchema } from "graphql";
import useGqlSchemaDefinitions, {
	GraphQLSchemaDefinition,
} from "../../../composables/use-gql-schema-definitions";
import { Consola } from "../../..";

let schema: GraphQLSchema;
const schemaDefinitionsRoot = "./external/routes/api";
const useQueries = useGqlSchemaDefinitions(`${schemaDefinitionsRoot}/queries`);
const useMutations = useGqlSchemaDefinitions(
	`${schemaDefinitionsRoot}/mutations`,
);
const useSubscriptions = useGqlSchemaDefinitions(
	`${schemaDefinitionsRoot}/subscriptions`,
);
const useTypes = useGqlSchemaDefinitions(`${schemaDefinitionsRoot}/types`);
const useDirectives = useGqlSchemaDefinitions(
	`${schemaDefinitionsRoot}/directives`,
);

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

	const directives = await collateDirectives({
		request,
		response,
		context,
		aggregator: useDirectives,
	});

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

	// For reference on how directives should be defined
	// https://www.graphql-tools.com/docs/schema-directives
	Object.keys(directives).forEach(directive => {
		schema = directives[directive](directive)(schema);
	});

	return schema;
}

async function collateDirectives({
	request,
	response,
	context,
	aggregator,
}: Omit<CollateDefinitionsArguments, "root">) {
	const isPromise = (o: any) =>
		typeof o === "object" && o.then && typeof o.then === "function";

	const aggregated = await aggregator(request, response, context);

	const hasDefinitions = aggregated.every(handler => !!handler.definition);
	const hasResolver = aggregated.every(handler => !!handler.resolve);
	const returnsPromise = aggregated
		.filter(handler => !!handler.resolve)
		.some(handler => isPromise(handler.resolve));

	if (!hasDefinitions)
		return Consola.error(
			"Every directive must provide its name in the definition",
		);

	if (!hasResolver)
		return Consola.error("Every directive must provide a resolver");

	if (returnsPromise)
		return Consola.error("Directive definitions cannot return a Promise");

	return aggregated.reduce(
		(accumulator, directive) => ({
			...accumulator,
			[directive.definition as string]: directive.resolve,
		}),
		Object.create(null),
	);
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
