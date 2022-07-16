import { Resolver } from "@parcel/plugin";
import { resolve } from "path";

import { findRootDir } from "../../../utilities/root-dir";
import {
	transformForVm,
	traverseDirs,
} from "../../code-gen/transformer/transformer";

export default new Resolver({
	resolve: async ({ specifier }) => {
		const projectRoot = findRootDir();

		const currentDir = resolve(__dirname, "../../");
		const allRoutes = [
			resolve(currentDir, "./route/internal"),
			`${projectRoot}/src/external/routes`,
		];
		const allAdapters = [
			resolve(currentDir, "./adapter/internal"),
			`${projectRoot}/src/external/adapters`,
		];
		const allMiddleware = [
			resolve(currentDir, "./middleware/internal"),
			`${projectRoot}/src/external/middleware`,
		];

		const transform = (code: string) => transformForVm(code, "default", "");

		switch (specifier) {
			case "#adapters":
				return {
					filePath: `${projectRoot}/src/external/adapters/adapters.ts`,
					code: await traverseDirs(allAdapters, transform),
				};
			case "#entities":
				return {
					filePath: `${projectRoot}/src/entities/entities.ts`,
					code: await traverseDirs(`${projectRoot}/src/entities`, transform),
				};
			case "#composables":
				return {
					filePath: `${projectRoot}/src/composables/composables.ts`,
					code: await traverseDirs(`${projectRoot}/src/composables`, transform),
				};
			case "#plugins":
				return {
					filePath: `${projectRoot}/src/external/plugins/plugins.ts`,
					code: await traverseDirs(
						`${projectRoot}/src/external/plugins`,
						transform,
					),
				};
			case "#middleware":
				return {
					filePath: `${projectRoot}/src/external/middleware/middleware.ts`,
					code: await traverseDirs(allMiddleware, transform),
				};
			case "#routes":
				return {
					filePath: `${projectRoot}/src/external/routes/routes.ts`,
					code: await traverseDirs(allRoutes, transform),
				};
			default:
				return null;
		}
	},
});
