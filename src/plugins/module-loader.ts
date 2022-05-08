import { ServeContext } from "../listeners/context/context";
import { Logger } from "../adapters/logger/logger";
import { resolve } from "path/posix";
import ls from "../composables/ls";
import isJavaScript from "../composables/is-javascript";
import convertCase from "../composables/convert-case";
import findRootDirectory from "../composables/find-root-directory";
import getJavaScriptFilename from "../composables/get-js-filename";
import { findComposables } from "../composables/find-composables";
import isPathValid from "../composables/is-path-valid";

export interface ModuleLoader {
	/**
	 * Loads all entities and the adapters they need
	 *
	 * Goes through src/entities and gets all the adapters which are needed.
	 * Then, load up all the adapters and initialize all the entities which
	 * are present.
	 */
	load: () => Promise<void>;
}

export type ModuleLoaderMaker = (context: ServeContext) => ModuleLoader;

export default function buildMakeModuleLoader({
	Logger,
}: {
	Logger: Logger;
}): ModuleLoaderMaker {
	const adapters = Object.create(null);

	const loadAdapters = async (
		sourceDirectory: string,
		context: ServeContext,
	) => {
		const adaptersPath = resolve(sourceDirectory, "./dist/external/adapters");

		if (await isPathValid(adaptersPath)) {
			for await (const file of ls(adaptersPath)) {
				if (isJavaScript(file)) {
					const filenameRegex = /[\w\d]*.js/;

					if (filenameRegex.test(file)) {
						const fileName = getJavaScriptFilename(file);

						if (fileName) {
							const adapterName = convertCase(fileName.replace(".js", ""));

							const adapterExports = await import(file);

							if (!adapterExports.default) continue;

							const adapterImport: Adapter = adapterExports.default;

							adapters[adapterName] = adapterImport;
							context.set(adapterName, adapterImport);

							Logger.success(`Loaded adapter: ${adapterName}`);
						}
					}
				}
			}
		}
	};

	const loadComposables = async () => {
		const composables = await findComposables();

		for (const composable of composables) {
			const composableExports = await import(composable.dist);

			if (!composableExports.default) continue;

			const fn = composableExports.default;

			// @ts-expect-error The types for the composable will be generated
			global[`build${composable.name}`] = fn;

			Logger.success(`Loaded composable: ${composable.name}`);
		}
	};

	return function makeModuleLoader(context): ModuleLoader {
		return Object.freeze({
			load: async () => {
				const rootDirectory = await findRootDirectory();

				const entitiesPath = resolve(rootDirectory, "./dist/entities");

				await loadAdapters(rootDirectory, context);
				await loadComposables();

				if (await isPathValid(entitiesPath)) {
					for await (const file of ls(entitiesPath)) {
						if (isJavaScript(file)) {
							const filenameRegex = /[\w\d]*.js/;

							if (isJavaScript(file)) {
								const fileName = file.match(filenameRegex)?.pop();
								if (fileName) {
									const entityName = convertCase(fileName.replace(".js", ""));

									const entityExports = await import(file);

									if (!entityExports.default) continue;

									const buildMakeEntity: EntityBuilder = entityExports.default;

									let entityConfiguration: any;

									const configurationKey = `configuration:${entityName}`;

									if (!context.has(configurationKey))
										entityConfiguration = Object.create(null);
									else entityConfiguration = context.get(configurationKey);

									if (typeof entityConfiguration !== "object")
										throw new TypeError(
											`Configuration for ${entityName} must be an object`,
										);

									const makeEntity: EntityMaker = buildMakeEntity(adapters);
									const importedEntity: Entity =
										makeEntity(entityConfiguration);

									context.set(entityName, importedEntity);

									Logger.success(`Loaded entity: ${entityName}`);
								}
							}
						}
					}
				}
			},
		});
	};
}

type EntityBuilder = (adapters: Record<string, any>) => EntityMaker;
type EntityMaker = (configuration: Record<string, any>) => Entity;
type Entity = Record<string, any>;

type Adapter = Record<string, any>;
