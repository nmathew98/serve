import { Logger } from "../logger/logger";
import { readdir } from "fs/promises";
import listenerBlacklist from "./blacklist.json";
import { ServeContext } from "../context/context";

export interface Listener {
	initialize(): Promise<void>;
	listen(): Promise<void>;
}

export default function buildMakeListeners({ Logger }: { Logger: Logger }) {
	return function makeListeners(context: ServeContext): Listener {
		const listeners: Listener[] = [];

		return Object.freeze({
			initialize: async () => {
				try {
					const files = await readdir(__dirname, {
						withFileTypes: true,
					});
					const folders = files
						.filter(file => file.isDirectory())
						.map(directory => directory.name);

					for (const folder of folders) {
						if (!(listenerBlacklist.blacklist as string[]).includes(folder)) {
							const listenerPath = getListenerPath(__dirname, folder);

							const { default: buildMakeListener } = await import(listenerPath);

							const makeListener = buildMakeListener({ Logger });
							const listener: Listener = makeListener(context);

							listeners.push(listener);
						}
					}
				} catch (error: any) {
					Logger.error(error.message);
				}
			},
			listen: async () => {
				listeners.forEach(async listener => {
					await listener.initialize();
					await listener.listen();
				});
			},
		});
	};
}

function getListenerPath(directory: string, listenerFolder: string) {
	return `${directory}/${listenerFolder}/${listenerFolder}.ts`;
}
