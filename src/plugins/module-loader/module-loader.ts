import { ServeContext } from "../../listeners/context/context";
import { Logger } from "../../adapters/logger/logger";
import { resolve } from "path/posix";
import { readFile, readdir } from "fs/promises";
import { Colors } from "../../adapters/colors/colors";
import { Emoji } from "../../adapters/emoji/emoji";
import { findOutputDirectory } from "../../utilities/directory/directory";
import { findComposables } from "../composables/composables";

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
	Colors,
	Emoji,
}: {
	Logger: Logger;
	Colors: Colors;
	Emoji: Emoji;
}): ModuleLoaderMaker {
	const adapters = Object.create(null);

	const buildMakeRegex = /(?:build[A-Z]+[A-Za-z]+\({)([\s\w,]*)(?:})/gim;
	let sourceDirectory;

	const loadAdapters = async (sourceDirectory: string, mock?: any) => {
		const entitiesPath = resolve(sourceDirectory, "./entities");
		const adaptersPath = resolve(sourceDirectory, "./external/adapters");

		const files = await readdir(entitiesPath, {
			withFileTypes: true,
		});
		const folders = files
			.filter(file => file.isDirectory())
			.map(directory => directory.name);

		for (const folder of folders) {
			const buffer = await readFile(`${entitiesPath}/${folder}/${folder}.js`);

			const contents = buffer.toString().replace(/(?:\r\n|\r|\n|\t)/g, " ");

			if (!buildMakeRegex.test(contents)) continue;

			const matchedLine = contents.match(buildMakeRegex)?.pop();

			if (!matchedLine) continue;

			const adaptersList = [...matchedLine.matchAll(buildMakeRegex)]
				?.pop()
				?.slice(1)
				?.pop()
				?.split(",")
				?.map(item => item.trim())
				?.filter(item => !!item);

			if (!adaptersList) continue;

			for (const adapter of adaptersList) {
				if (adapter in adapters) continue;

				Logger.log(
					Colors.yellow(`Loading adapter: ${adapter}`),
					Emoji.hourglass,
				);
				const adapterFolder = getAdapterFolderFromName(adapter);
				const adapterPath = getModulePathFromFolder(
					adaptersPath,
					adapterFolder,
				);

				const { default: adapterImport }: AdapterImport = await importModule(
					adapterPath,
					mock,
				);

				adapters[adapter] = adapterImport;

				Logger.log(
					Colors.green(`Loaded adapter: ${adapter}`),
					Emoji.whiteCheckMark,
				);
			}
		}
		Logger.log();
	};

	const loadComposables = async () => {
		const composables = await findComposables();

		for (const composable of composables) {
			Logger.log(
				Colors.yellow(`Loading composable: ${composable.name}`),
				Emoji.hourglass,
			);

			const { default: fn } = await import(composable.distPath);

			// @ts-expect-error The types for the composable will be generated
			global[`build${composable.name}`] = fn;

			Logger.log(
				Colors.green(`Loaded composable: ${composable.name}`),
				Emoji.whiteCheckMark,
			);
		}
		Logger.log();
	};

	return function makeModuleLoader(context): ModuleLoader {
		let entityBlacklist: string[];

		if (!context.has("configuration:entity:blacklist")) entityBlacklist = [];
		else entityBlacklist = context.get("configuration:entity:blacklist");

		if (!Array.isArray(entityBlacklist))
			throw new TypeError("Entity blacklist must be a string array");
		if (Array.isArray(entityBlacklist) && entityBlacklist.length > 0)
			if (!entityBlacklist.every(item => typeof item === "string"))
				throw new TypeError("Entity blacklist must be a string array");

		return Object.freeze({
			load: async () => {
				sourceDirectory = await findOutputDirectory();

				const entitiesPath = resolve(sourceDirectory, "./entities");

				await loadAdapters(sourceDirectory);
				await loadComposables();

				const files = await readdir(entitiesPath, {
					withFileTypes: true,
				});
				const entities = files
					.filter(file => file.isDirectory())
					.map(directory => directory.name);

				for (const entity of entities) {
					if (entityBlacklist.includes(entity)) continue;

					const entityName = getEntityNameFromFolder(entity);
					Logger.log(
						Colors.yellow(`Loading entity: ${entityName}`),
						Emoji.hourglass,
					);

					let entityConfiguration: any;

					const configurationKey = getEntityConfigurationKeyFromFolder(entity);

					if (!context.has(configurationKey))
						entityConfiguration = Object.create(null);
					else entityConfiguration = context.get(configurationKey);

					if (typeof entityConfiguration !== "object")
						throw new TypeError(
							`Configuration for ${entityName} must be an object`,
						);

					const entityPath = getModulePathFromFolder(entitiesPath, entity);

					const { default: buildMakeEntity }: EntityImport = await importModule(
						entityPath,
					);

					const makeEntity: EntityMaker = buildMakeEntity(adapters);
					const importedEntity: Entity = makeEntity(entityConfiguration);

					context.set(entityName, importedEntity);
					Logger.log(
						Colors.green(`Loaded entity: ${entityName}`),
						Emoji.whiteCheckMark,
					);
				}
				Logger.log();
			},
		});
	};
}

type EntityImport = { default: EntityBuilder };
type EntityBuilder = (adapters: Record<string, any>) => EntityMaker;
type EntityMaker = (configuration: Record<string, any>) => Entity;
type Entity = Record<string, any>;

type AdapterImport = { default: Adapter };
type Adapter = Record<string, any>;

function importModule(
	path: string,
	mock?: (path: string) => Promise<any>,
): Promise<any> {
	return new Promise(resolve => {
		if (mock) return resolve(mock(path));

		return resolve(import(path));
	});
}

function getEntityConfigurationKeyFromFolder(folder: string) {
	return `configuration:entity:${getEntityNameFromFolder(folder)}`;
}

function getEntityNameFromFolder(folder: string) {
	return folder
		.split("-")
		.map(
			word => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`,
		)
		.join("");
}

function getAdapterFolderFromName(name: string) {
	return name
		.split(/(?=[A-Z][^A-Z])/)
		.join("-")
		.toLowerCase();
}

function getModulePathFromFolder(base: string, folder: string) {
	return `${base}/${folder.toLowerCase()}/${folder.toLowerCase()}`;
}
