import { Parcel } from "@parcel/core";

import { Logger } from "../adapter/internal/logger/logger";
import { ServeConfig } from "../serve/serve";

const createBundler = (config: ServeConfig) => {
	const bundler = new Parcel(config?.server?.parcel as any);

	return bundler;
};

export const build = async (config: ServeConfig) => {
	try {
		const bundler = createBundler(config);
		const { bundleGraph, buildTime } = await bundler.run();
		const bundles = bundleGraph.getBundles();

		Logger.log(`✅ Built ${bundles.length} bundles in ${buildTime}ms!`);
		Logger.log(`Output: ./.output`);
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
			Logger.log(`Output: ./.output`);
		} else if (event?.type === "buildFailure")
			Logger.error(`❌ ${event.diagnostics}`);
	});

	return subscription;
};
