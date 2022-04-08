import { ServeContext } from "$internals/context/context";
import {
	GraphQLFieldConfig,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLSchemaConfig,
	ThunkObjMap,
} from "graphql";
import { IncomingMessage, ServerResponse } from "h3";
import useQueries from "../queries/queries";
import useMutations from "../mutations/mutations";
import useTypes from "../types/types";
import useSubscription from "../subscriptions/subscriptions";

export default async function useSchema(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	const configuration: GraphQLSchemaConfig = {
		query: await createQuery(request, response, context, useQueries),
		mutation: await createMutation(request, response, context, useMutations),
		types: await useTypes(),
	};

	if (context.has("configuration:graphql:subscription"))
		if (context.get("configuration:graphql:subscription"))
			configuration.subscription = await createSubscription(
				request,
				response,
				context,
				useSubscription,
			);

	const schema = new GraphQLSchema(configuration);

	if (context.has("configuration:graphql:subscription"))
		if (context.get("configuration:graphql:subscription"))
			context.set("configuration:graphql:schema", schema);

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

async function createSubscription(
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
		name: "RootSubscriptionType",
		fields: await fields(request, response, context),
	});
}