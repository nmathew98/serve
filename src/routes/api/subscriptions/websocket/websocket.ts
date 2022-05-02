import { Server, WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { GraphQLSchema } from "graphql";
import { ServeContext } from "../../../../listeners/context/context";
import { Listener } from "../../../../listeners/h3/h3";

export default function makeSubscriptionListener(
	context: ServeContext,
): Listener {
	let server: Server;

	return Object.freeze({
		initialize: async () => {
			if (!context.has("graphql:schema")) return;

			let port: number = +(process.env.WS_PORT ?? "5000");

			if (typeof port !== "number")
				throw new TypeError("WebSocket port is invalid!");

			server = new WebSocketServer({
				port,
				path: "/api",
			});
		},
		listen: async () => {
			if (!context.has("graphql:schema")) return;

			if (!server) throw new Error("WebSocket server not initialized");

			const schema: GraphQLSchema = context.get("graphql:schema");

			useServer({ schema }, server);

			context.set("graphql:ws:listening", true);
		},
	});
}
