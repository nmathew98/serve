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
