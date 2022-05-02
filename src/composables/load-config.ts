import { loadConfig as c12 } from "c12";

export default async function loadConfig(cwd: string) {
	const defaults = {
		routes: {
			api: {
				enabled: true,
				protect: true,
				graphql: {
					subscription: false,
				},
			},
			storage: {
				enabled: true,
				protect: true,
			},
		},
	};

	const { config } = await c12({
		cwd: cwd,
		name: "serve",
		dotenv: true,
		defaults,
	});

	return config;
}
