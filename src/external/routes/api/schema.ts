import { ServeContext } from "$internals/context/context";
import {
	GraphQLFieldConfig,
	GraphQLObjectType,
	GraphQLSchema,
	ThunkObjMap,
} from "graphql";
import { IncomingMessage, ServerResponse } from "http";
import useQueries from "./queries/queries";
import useMutations from "./mutations/mutations";

export default async function useSchema(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	const schema = new GraphQLSchema({
		query: await createQuery(request, response, context, useQueries),
		mutation: await createMutation(request, response, context, useMutations),
		types: [],
	});

	return schema;
}

type GraphQLField = ThunkObjMap<GraphQLFieldConfig<any, any, any>>;

async function createQuery(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
	fields: (
		request: IncomingMessage,
		response: ServerResponse,
		context: ServeContext,
	) => Promise<GraphQLField>,
) {
	return new GraphQLObjectType({
		name: "RootQueryType",
		fields: await fields(request, response, context),
	});
}

async function createMutation(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
	fields: (
		request: IncomingMessage,
		response: ServerResponse,
		context: ServeContext,
	) => Promise<GraphQLField>,
) {
	return new GraphQLObjectType({
		name: "RootMutationType",
		fields: await fields(request, response, context),
	});
}
