import { Logger } from "../logger/logger";
import { Dirent as DirectoryEntry } from "fs";
import { readdir } from "fs/promises";
import { Utils } from "../utils/utils";
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
				const files: DirectoryEntry[] = await readdir(__dirname, {
					withFileTypes: true,
				});
				const folders: string[] = files
					.filter((file: DirectoryEntry) => file.isDirectory())
					.map((directory: DirectoryEntry) => directory.name);

				for (const folder of folders) {
					if (!(listenerBlacklist.blacklist as string[]).includes(folder)) {
						const listenerPath: string = Utils.getListenerPath(
							__dirname,
							folder,
						);

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
