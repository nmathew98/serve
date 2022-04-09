import { Logger } from "../logger/logger";
import { readdir } from "fs/promises";
import { ServeContext } from "../context/context";
import { Colors } from "../colors/colors";
import { Emoji } from "../emoji/emoji";

export interface Listener {
	/**
	 * Loads all listeners which are not blacklisted
	 *
	 * Goes through each directory in the current directory
	 * and loads the listener within it
	 */
	initialize(): Promise<void>;
	/**
	 * Initializes and sets up all listeners which have been imported
	 */
	listen(): Promise<void | ServeContext>;
}

export type ListenerImport = { default: ListenerBuilder };

export type ListenerBuilder = ({
	Logger,
	Colors,
	Emoji,
}: {
	Logger: Logger;
	Colors: Colors;
	Emoji: Emoji;
}) => ListenerMaker;

export interface ListenerMaker {
	(context: ServeContext): Listener;
	(context: ServeContext, mock?: any): Listener;
}

export default function buildMakeListeners({
	Logger,
	Colors,
	Emoji,
}: {
	Logger: Logger;
	Colors: Colors;
	Emoji: Emoji;
}): ListenerMaker {
	return function makeListeners(context, mock?): Listener {
		const importedListeners: Listener[] = [];

		let listenerBlacklist: string[];
		if (!context.has("configuration:listener:blacklist"))
			listenerBlacklist = [];
		else listenerBlacklist = context.get("configuration:listener:blacklist");

		if (!Array.isArray(listenerBlacklist))
			throw new TypeError("Listener blacklist must be a string array");
		if (Array.isArray(listenerBlacklist) && listenerBlacklist.length > 0)
			if (!listenerBlacklist.every(item => typeof item === "string"))
				throw new TypeError("Listener blacklist must be a string array");

		return Object.freeze({
			initialize: async () => {
				const packageDetails = context.get("configuration:serve:package");
				Logger.log(
					Colors.brightGreen(
						`${packageDetails.name}@${packageDetails.version} powering up ...`,
					),
				);

				try {
					const files = await readdir(__dirname, {
						withFileTypes: true,
					});

					const listeners = files
						.filter(file => file.isDirectory())
						.map(directory => directory.name);

					for (const listener of listeners) {
						if (listenerBlacklist.includes(listener)) continue;

						const listenerPath = getListenerPath(__dirname, listener);

						const { default: buildMakeListener }: ListenerImport =
							await importModule(listenerPath, mock?.import);

						const makeListener: ListenerMaker = buildMakeListener({
							Logger,
							Colors,
							Emoji,
						});
						const importedListener: Listener = makeListener(context);

						importedListeners.push(importedListener);
					}
				} catch (error: any) {
					Logger.error(Colors.red(error.message));
				}
			},
			listen: async () => {
				for (const listener of importedListeners) {
					await listener.initialize();
					await listener.listen();
				}

				return context;
			},
		});
	};
}

/* istanbul ignore next */
function importModule(
	path: string,
	mock?: (path: string) => Promise<any>,
): Promise<any> {
	return new Promise(resolve => {
		if (mock) return resolve(mock(path));

		return resolve(import(path));
	});
}

/* istanbul ignore next */
function getListenerPath(base: string, folder: string) {
	return `${base}/${folder.toLowerCase()}/${folder.toLowerCase()}`;
}
