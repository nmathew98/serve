import { resolve } from "path/posix";
import { readdir } from "fs/promises";

let sourceDirectory: string;

/**
 * Walk upwards until we encounter a folder named `src`
 *
 * @param {string} path no need to set this, its used internally
 * @returns the path to the directory named `src`
 */
export default async function findSourceDirectory(
	path?: string,
): Promise<string> {
	if (sourceDirectory) return sourceDirectory;

	let currentDirectory;
	if (path) currentDirectory = path;
	else currentDirectory = __dirname;

	const files = await readdir(currentDirectory, {
		withFileTypes: true,
	});
	const folders = files
		.filter(file => file.isDirectory())
		.map(directory => directory.name);

	if (folders.includes("src")) {
		sourceDirectory = `${currentDirectory}/src`;
		return sourceDirectory;
	} else return await findSourceDirectory(resolve(currentDirectory, "../"));
}
