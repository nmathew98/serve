import { Transform } from "@graphql-tools/delegate";
import { loadConfig as c12 } from "c12";

export default async function loadConfig(
	cwd: string,
	name?: string,
	defaults?: Record<string, any>,
) {
	const configDefaults = defaults ?? {
		routes: {
			api: {
				enabled: true,
				protect: true,
			},
			storage: {
				enabled: true,
				protect: true,
			},
		},
	};

	const { config } = await c12({
		cwd: cwd,
		name: name ?? "serve",
		dotenv: true,
		defaults: configDefaults,
	});

	return config as Record<string, any>;
}

export interface ServeConfiguration {
	/**
	 * Server configuration
	 */
	server?: {
		/**
		 * To enable HTTP2 provide the path to a key and a cert
		 */
		spdy?: {
			key: string;
			cert: string;
		};
	};
	/**
	 * Sentry configuration
	 */
	sentry?: {
		dsn: string;
		tracesSampleRate: string;
		environment: string;
	};
	/**
	 * Route configuration
	 */
	routes?: {
		/**
		 * API configuration
		 */
		api?: {
			/**
			 * Set this to false to disable the API route
			 */
			enabled?: boolean;
			/**
			 * Set this to false to disable requiring authorization for the API route
			 */
			protect?: boolean;
			/**
			 * If the graph is federated specify the subgraphs
			 */
			subgraphs?: GraphQLSubgraph[];
		};
		/**
		 * Storage route configuration
		 */
		storage?: {
			/**
			 * Set this to false to disable the storage route
			 */
			enabled?: boolean;
			/**
			 * Set this to false to disable requiring authorization for the storage route
			 */
			protect?: boolean;
		};
	};
	/**
	 * Specify path aliases here
	 *
	 * For example
	 * ```
	 * "@composables": "src/composables/"
	 * ```
	 */
	alias?: {
		[key: string]: string;
	};
}

export interface GraphQLSubgraph {
	/**
	 * The remote location of the subgraph
	 */
	location: string;
	/**
	 * A record of the headers if any are required for authorization
	 */
	headers?: Record<string, any>;
	transforms?: Transform[];
}

export function isGraphQLSubgraph(o: any): o is GraphQLSubgraph {
	if (typeof o !== "object") return false;

	if (!o.location) return false;

	if (o.headers) if (typeof o.headers !== "object") return false;

	return true;
}
