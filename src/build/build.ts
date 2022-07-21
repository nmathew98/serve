import { Parcel } from "@parcel/core";
import { resolve } from "path";
import { fileURLToPath } from "url";

import { Logger } from "../adapter/internal/logger/logger";
import { ServeConfig } from "../serve/serve";
import { findRootDir } from "../utilities/root-dir";

const createBundler = (config: ServeConfig) => {
	const projectDir = findRootDir();

	const defaultOptions = {
		entries: resolve(__dirname, "../", "server.ts"),
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
			distDir: resolve(projectDir, "./output"),
		},
	};

	const mergedOptions = {
		...defaultOptions,
		...config?.server?.parcel,
	};

	const bundler = new Parcel(mergedOptions as any);

	return bundler;
};

export const build = async (config: ServeConfig) => {
	try {
		const bundler = createBundler(config);
		const { bundleGraph, buildTime } = await bundler.run();
		const bundles = bundleGraph.getBundles();

		Logger.log(`✅ Built ${bundles.length} bundles in ${buildTime}ms!`);
	} catch (error: any) {
		Logger.error(`❌ ${error.diagnostics}`);
	}
};

export const watch = async (config: ServeConfig) => {
	const bundler = createBundler(config);
	const subscription = await bundler.watch((err, event) => {
		if (err) throw err;

		if (event?.type === "buildSuccess") {
			const bundles = event.bundleGraph.getBundles();

			Logger.log(`✅ Built ${bundles.length} bundles in ${event.buildTime}ms!`);
		} else if (event?.type === "buildFailure")
			Logger.error(`❌ ${event.diagnostics}`);
	});

	return subscription;
};
