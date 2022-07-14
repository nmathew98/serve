import { resolve } from "pathe";

import { useStore } from "./store";

export const findRootDir = () => {
	let rootDir = useStore("root-dir");

	if (rootDir) return rootDir;

	const directoryRegex = /(.*)(?:\/node_modules\/@skulpture\/serve)/gim;
	const currentDir = resolve(__dirname);

	const possibleRootDir = [...currentDir.matchAll(directoryRegex)]
		?.pop()
		?.slice(1)
		?.pop();

	if (!possibleRootDir) throw new Error("Unable to determine root directory");

	rootDir = possibleRootDir;

	return rootDir;
};
