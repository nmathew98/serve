import { IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "@skulpture/serve";
import { GraphQLString } from "graphql";

export default function testMutation(
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
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
