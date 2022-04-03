import { Logger } from "../logger/logger";
import { readdir } from "fs/promises";
import { ServeContext } from "../context/context";
import { Colors } from "$internals/colors/colors";
import { Emoji } from "$internals/emoji/emoji";
import packageDetails from "../../../package.json";

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
	listen(): Promise<void>;
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

export type ListenerMaker = (context: ServeContext) => Listener;

export default function buildMakeListeners({
	Logger,
	Colors,
	Emoji,
}: {
	Logger: Logger;
	Colors: Colors;
	Emoji: Emoji;
}) {
	return function makeListeners(context: ServeContext): Listener {
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

						const { default: buildMakeListener }: ListenerImport = await import(
							listenerPath
						);

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
				importedListeners.forEach(async listener => {
					await listener.initialize();
					await listener.listen();
				});
			},
		});
	};
}

function getListenerPath(base: string, folder: string) {
	return `${base}/${folder.toLowerCase()}/${folder.toLowerCase()}`;
}
