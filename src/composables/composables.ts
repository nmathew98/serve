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
		const composablePath = `${composablesPath}/${composable}`;

		const importedComposables = await import(composablePath);

		for (const importedComposable of Object.keys(importedComposables)) {
			if (typeof importedComposables[importedComposable] !== "function")
				continue;

			const composableName = (
				importedComposables[importedComposable] as Function
			).name;

			if (!composableName) continue;

			declarations += `\n\tconst ${composableName}: typeof import('${composablePath})`;
		}
	}
	declarations += "\n}";

	await createDeclarationOutputFolder(rootDirectory);

	await writeFile(
		`${rootDirectory}/serve/types/composables.d.ts`,
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
		await stat(`${rootDirectory}/serve/types`);
	} catch (error: any) {
		await mkdir(`${rootDirectory}/serve/types`, { recursive: true });
	}
}
