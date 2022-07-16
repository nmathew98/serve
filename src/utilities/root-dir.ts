import { resolve } from "path";

import { useStore } from "./store";

export const findRootDir = () => {
	const [rootDir, setRootDir] = useStore<string>("root-dir");

	if (rootDir) return rootDir;

	const directoryRegex = /(.*)(?:\/node_modules\/@skulpture\/serve)/gim;
	const currentDir = resolve(__dirname);

	const possibleRootDir = [...currentDir.matchAll(directoryRegex)]
		?.pop()
		?.slice(1)
		?.pop();

	if (!possibleRootDir) throw new Error("Unable to determine root directory");

	setRootDir(possibleRootDir);

	return possibleRootDir;
};
