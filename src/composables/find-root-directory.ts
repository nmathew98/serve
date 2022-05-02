import { resolve } from "path/posix";

export default async function findRootDirectory(): Promise<string> {
	const directoryRegex = /(.*)(?:\/node_modules\/@skulpture\/serve)/gim;
	const currentDirectory = resolve(__dirname);

	const packageDirectory = [...currentDirectory.matchAll(directoryRegex)]
		?.pop()
		?.slice(1)
		?.pop();

	if (!packageDirectory) throw new Error("Unable to determine root directory");

	return packageDirectory;
}
