import { Server, WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { GraphQLSchema } from "graphql";
import { ServeContext } from "../../../../listeners/context/context";
import { Listener } from "../../../../listeners/listeners";

export default function makeSubscriptionListener(
	context: ServeContext,
): Listener {
	let server: Server;

	return Object.freeze({
		initialize: async () => {
			if (!context.has("configuration:graphql:schema")) return;

			let port: number;

			if (!context.has("configuration:graphql:ws:port")) port = 4000;
			else port = context.get("configuration:graphql:ws:port");

			if (typeof port !== "number")
				throw new TypeError("WebSocket port is invalid!");

			server = new WebSocketServer({
				port,
				path: "/api",
			});
		},
		listen: async () => {
			if (!context.has("configuration:graphql:schema")) return;

			if (!server) throw new Error("WebSocket server not initialized");

			const schema: GraphQLSchema = context.get("configuration:graphql:schema");

			useServer({ schema }, server);

			context.set("configuration:graphql:ws:listening", true);
		},
	});
}
