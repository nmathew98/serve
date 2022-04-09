import { IncomingMessage, ServerResponse } from "h3";
import { ServeContext } from "@skulpture/serve";
import { GraphQLString } from "graphql";
import buildPrintHelloWorld from "$app/print-hello-world";
import { Example } from "$entities/example/example";

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
			resolve: (_: any, { x }: any) => {
				// Always check if a module is available before accessing it
				if (!context.has("Example"))
					throw new Error("Example module not found!");

				const Example: Example = context.get("Example");

				const printHelloWorld = buildPrintHelloWorld({ Example });

				printHelloWorld(x);

				return `${x}!!!`;
			},
		},
	};
}
