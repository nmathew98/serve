import { IncomingMessage, ServerResponse } from "http";
import { ServeContext } from "$internals/context/context";
import { GraphQLString } from "graphql";

export default function testMutation(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	return {
		world: {
			type: GraphQLString,
			args: {
				x: {
					type: GraphQLString,
				},
			},
			resolve: (_: any, { x }: any) => x,
		},
	};
}
