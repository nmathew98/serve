import { opendir } from "fs/promises";
import { resolve, join } from "path/posix";

export async function findRootDirectory(): Promise<string> {
	const directoryRegex = /(.*)(?:\/node_modules\/@skulpture\/serve)/gim;
	const currentDirectory = resolve(__dirname);

	const packageDirectory = [...currentDirectory.matchAll(directoryRegex)]
		?.pop()
		?.slice(1)
		?.pop();

	if (!packageDirectory) throw new Error("Unable to determine root directory");

	return packageDirectory;
}

export async function findOutputDirectory(): Promise<string> {
	const rootDirectory = await findRootDirectory();

	const outputDirectory = process.env.OUTPUT_DIRECTORY ?? "dist";

	return `${rootDirectory}/${outputDirectory}`;
}

export async function* walk(directory: string): AsyncGenerator<string> {
	for await (const d of await opendir(directory)) {
		const entry = join(directory, d.name);
		if (d.isDirectory()) yield* walk(entry);
		else if (d.isFile() && /.*.js/gm.test(d.name)) yield entry;
	}
}
