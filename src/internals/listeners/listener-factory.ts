import { Logger } from "../logger/logger";
import { readdir } from "fs/promises";
import { Utils } from "../utilities/utilities";
import listenerBlacklist from "./blacklist.json";
import { ServeContext } from "../context/context";

export interface Listener {
	initialize(): Promise<void>;
	listen(): Promise<void>;
}

export interface ListenerFactory {
	getListeners: () => Promise<Listener[]>;
}

export default function buildMakeListenerFactory({
	Logger,
}: {
	Logger: Logger;
}) {
	return function makeListenerFactory(context: ServeContext): ListenerFactory {
		const listeners: Listener[] = [];

		return Object.freeze({
			getListeners: async () => {
				const files = await readdir(__dirname, {
					withFileTypes: true,
				});
				const folders = files
					.filter(file => file.isDirectory())
					.map(directory => directory.name);

				for (const folder of folders) {
					if (!(listenerBlacklist.blacklist as string[]).includes(folder)) {
						const listenerPath = Utils.getListenerPath(__dirname, folder);

						const listenerImport = await import(listenerPath);
						const buildMakeListener = listenerImport.default;

						const makeListener = buildMakeListener({ Logger });
						const listener: Listener = makeListener(context);

						listeners.push(listener);
					}
				}

				return listeners;
			},
		});
	};
}
