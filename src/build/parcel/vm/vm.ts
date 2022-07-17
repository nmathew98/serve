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
		const allSchemaDefs = [
			`${projectRoot}/src/external/routes/api/queries`,
			`${projectRoot}/src/external/routes/api/mutations`,
			`${projectRoot}/src/external/routes/api/subscriptions`,
			`${projectRoot}/src/external/routes/api/types`,
			`${projectRoot}/src/external/routes/api/directives`,
		];

		const adapterTransformer = (code: string) =>
			transformForVm(code, "adapter");
		const entityTransformer = (code: string) => transformForVm(code, "entity");
		const pluginTransformer = (code: string) => transformForVm(code, "plugin");
		const middlewareTransformer = (code: string) =>
			transformForVm(code, "middleware");
		const schemaDefTransformer = (code: string) =>
			transformForVm(code, "schemaDef");
		const routeTransformer = (code: string) => transformForVm(code, "route");

		switch (specifier) {
			case "#adapters":
				return {
					filePath: `${projectRoot}/src/external/adapters/adapters.ts`,
					code: await traverseDirs(allAdapters, adapterTransformer),
				};
			case "#entities":
				return {
					filePath: `${projectRoot}/src/entities/entities.ts`,
					code: await traverseDirs(
						`${projectRoot}/src/entities`,
						entityTransformer,
					),
				};
			case "#plugins":
				return {
					filePath: `${projectRoot}/src/external/plugins/plugins.ts`,
					code: await traverseDirs(
						`${projectRoot}/src/external/plugins`,
						pluginTransformer,
					),
				};
			case "#middleware":
				return {
					filePath: `${projectRoot}/src/external/middleware/middleware.ts`,
					code: await traverseDirs(allMiddleware, middlewareTransformer),
				};
			case "#schemaDefs":
				return {
					filePath: `${projectRoot}/src/external/routes/api/schema.ts`,
					code: await traverseDirs(allSchemaDefs, schemaDefTransformer),
				};
			case "#routes":
				return {
					filePath: `${projectRoot}/src/external/routes/routes.ts`,
					code: await traverseDirs(allRoutes, routeTransformer),
				};
			default:
				return null;
		}
	},
});
