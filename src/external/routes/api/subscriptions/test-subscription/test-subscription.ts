import { IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "$internals/context/context";
import { GraphQLString } from "graphql";

export default function testSubscription(
	context: ServeContext,
	request: IncomingMessage,
	response: ServerResponse,
) {
	return {
		greetings: {
			type: GraphQLString,
			subscribe: async function* () {
				for (const hi of ["Hi", "Bonjour", "Hola", "Ciao", "Zdravo"]) {
					yield { greetings: hi };
				}
			},
		},
	};
}
