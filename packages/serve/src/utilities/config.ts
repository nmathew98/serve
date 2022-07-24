import { loadConfig, loadDotenv } from "c12";
import { resolve } from "path";
import { fileURLToPath } from "url";

import { findRootDir } from "./root-dir";

export const config = async () => {
	const projectDir = findRootDir();

	const defaults = {
		server: {
			parcel: {
				entries: resolve(projectDir, "./src/app.ts"),
				defaultConfig: "@parcel/defaultConfig",
				mode: process.env.NODE_ENV || "development",
				targets: ["modern"],
				additionalReporters: [
					{
						packageName: "@parcel/reporter-cli",
						resolveFrom: fileURLToPath(import.meta.url),
					},
				],
				logLevel: process.env.NODE_ENV === "development" ? "verbose" : "info",
				shouldAutoInstall: true,
				shouldBuildLazily: true,
				defaultTargetOptions: {
					shouldOptimize: true,
					shouldScopeHoist: true,
					outputFormat: "esmodule",
					sourceMaps: true,
					distDir: resolve(projectDir, "./.output"),
				},
			},
		},
		alias: {
			"@entities": `${projectDir}/internal/entities`,
			"@composables": `${projectDir}/internal/composables`,
			"@adapters": `${projectDir}/external/adapters`,
		},
	};

	await loadDotenv({
		cwd: resolve(projectDir),
		interpolate: true,
	});

	const { config } = await loadConfig({
		cwd: resolve(projectDir),
		name: "serve",
		dotenv: true,
		defaults,
	});

	return config;
};
