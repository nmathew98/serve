import { resolve } from "path/posix";
import { ServeContext } from "../context/context";

export default async function findSourceDirectory(
	context: ServeContext,
): Promise<string> {
	const directoryRegex = /(.*)(?:\/node_modules\/@skulpture\/serve)/gim;
	const isProduction = process.env.NODE_ENV === "production";
	const currentDirectory = resolve(__dirname);

	const packageDirectory = [...currentDirectory.matchAll(directoryRegex)]
		?.pop()
		?.slice(1);

	let outputFolder;
	if (context.has("configuration:build:output")) {
		let outputInContext = context.get("configuration:build:output");

		if (typeof outputInContext === "string") outputFolder = outputInContext;
		else outputFolder = "dist";
	} else outputFolder = "dist";

	let sourceDirectory: string;
	if (isProduction) sourceDirectory = `${packageDirectory}/${outputFolder}`;
	else sourceDirectory = `${packageDirectory}/src`;

	return sourceDirectory;
}
