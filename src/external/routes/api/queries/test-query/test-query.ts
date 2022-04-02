import { IncomingMessage, ServerResponse } from "http";
import { ServeContext } from "$internals/context/context";
import { GraphQLString } from "graphql";

export default function testMutation(
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) {
	return {
		hello: {
			type: GraphQLString,
			args: {
				x: {
					type: GraphQLString,
				},
			},
			resolve: (_: any, { x }: any) => `${x}!`,
		},
	};
}
