/* eslint no-console: "off" */

import { writeFile, readdir, stat, mkdir } from "fs/promises";
import { resolve } from "path/posix";
import NodeEmoji from "../emoji/emoji";
import CliColors from "../colors/colors";
import { findRootDirectory } from "../directory/directory";

export default async function generateComposableDeclarations() {
	console.log(
		CliColors.yellow(`Generating composable declarations ...`),
		NodeEmoji.hourglass,
	);

	const rootDirectory = await findRootDirectory();

	const composablesPath = resolve(rootDirectory, "./src/composables");

	const files = await readdir(composablesPath, {
		withFileTypes: true,
	});
	const composables = files
		.filter(file => !file.isDirectory())
		.map(directory => directory.name);

	let declarations = "declare global {";
	for (const composable of composables) {
		const composableName = getComposableNameFromFile(
			composable.replace(".ts", ""),
		);
		const composablePath = `${composablesPath}/${composable}`;

		declarations += `\n\tconst build${composableName}: typeof import('${composablePath.replace(
			".ts",
			"",
		)}')['default']`;
	}
	declarations += "\n}";
	declarations += "\nexport {}";

	await createDeclarationOutputFolder(rootDirectory);

	await writeFile(
		`${rootDirectory}/src/serve/types/composables.d.ts`,
		declarations,
		{ flag: "w+" },
	);

	console.log(
		CliColors.green(`Generated composable declarations`),
		NodeEmoji.whiteCheckMark,
	);
}

async function createDeclarationOutputFolder(rootDirectory: string) {
	try {
		await stat(`${rootDirectory}/src/serve/types`);
	} catch (error: any) {
		await mkdir(`${rootDirectory}/src/serve/types`, { recursive: true });
	}
}

function getComposableNameFromFile(file: string) {
	return file
		.split("-")
		.map(word => word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase())
		.join("");
}
