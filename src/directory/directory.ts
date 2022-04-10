import { resolve } from "path/posix";

export default async function findSourceDirectory(): Promise<string> {
	const directoryRegex = /(.*)\/node_modules\/@skulpture\/serve/gim;
	const isProduction = process.env.NODE_ENV === "production";
	const currentDirectory = resolve(__dirname);

	const packageDirectory = currentDirectory
		.match(directoryRegex)
		?.pop() as string;

	let sourceDirectory: string;
	if (isProduction) sourceDirectory = `${packageDirectory}/dist`;
	else sourceDirectory = `${packageDirectory}/src`;

	return sourceDirectory;
}
