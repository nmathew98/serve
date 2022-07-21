import { Resolver } from "@parcel/plugin";
import { resolve } from "path";

import { findRootDir } from "../../../utilities/root-dir";
import { traverseDirsAndReexport } from "../../code-gen/export/export";

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
		const allSchemaDefs = [
			`${projectRoot}/src/external/routes/api/queries`,
			`${projectRoot}/src/external/routes/api/mutations`,
			`${projectRoot}/src/external/routes/api/subscriptions`,
			`${projectRoot}/src/external/routes/api/types`,
			`${projectRoot}/src/external/routes/api/directives`,
		];

		switch (specifier) {
			case "#adapters":
				return {
					filePath: `${projectRoot}/src/external/adapters/adapters.ts`,
					code: await traverseDirsAndReexport(allAdapters, "adapter"),
				};
			case "#entities":
				return {
					filePath: `${projectRoot}/src/entities/entities.ts`,
					code: await traverseDirsAndReexport(
						`${projectRoot}/src/entities`,
						"entity",
					),
				};
			case "#plugins":
				return {
					filePath: `${projectRoot}/src/external/plugins/plugins.ts`,
					code: await traverseDirsAndReexport(
						`${projectRoot}/src/external/plugins`,
						"plugin",
					),
				};
			case "#middleware":
				return {
					filePath: `${projectRoot}/src/external/middleware/middleware.ts`,
					code: await traverseDirsAndReexport(allMiddleware, "middleware"),
				};
			case "#schemaDefs":
				return {
					filePath: `${projectRoot}/src/external/routes/api/schema.ts`,
					code: await traverseDirsAndReexport(allSchemaDefs, "schemaDef"),
				};
			case "#routes":
				return {
					filePath: `${projectRoot}/src/external/routes/routes.ts`,
					code: await traverseDirsAndReexport(allRoutes, "route"),
				};
			default:
				return null;
		}
	},
});
