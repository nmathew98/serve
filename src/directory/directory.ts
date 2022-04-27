import { resolve } from "path/posix";

export default async function findSourceDirectory(): Promise<string> {
	const directoryRegex = /(.*)(?:\/node_modules\/@skulpture\/serve)/gim;
	const isProduction = process.env.NODE_ENV === "production";
	const currentDirectory = resolve(__dirname);

	const packageDirectory = [...currentDirectory.matchAll(directoryRegex)]
		?.pop()
		?.slice(1);

	const outputFolder = process.env.OUTPUT_DIRECTORY ?? "dist";

	let sourceDirectory: string;
	if (isProduction) sourceDirectory = `${packageDirectory}/${outputFolder}`;
	else sourceDirectory = `${packageDirectory}/src`;

	return sourceDirectory;
}
