import { resolve } from "path";
import convertCase from "./convert-case";
import findRootDirectory from "./find-root-directory";
import getTypeScriptFilename from "./get-ts-filename";
import isTypeScript from "./is-typescript";
import ls from "./ls";

export async function findComposables(): Promise<Composable[]> {
	const rootDirectory = await findRootDirectory();

	const composablesPath = resolve(rootDirectory, "./src/composables");

	const foundComposables: Composable[] = [];

	for await (const file of ls(composablesPath)) {
		if (isTypeScript(file)) {
			const fileName = getTypeScriptFilename(file);

			if (fileName) {
				const composableName = convertCase(fileName.replace(".ts", ""));

				foundComposables.push({
					name: composableName,
					src: file.replace(".ts", ""),
					dist: file.replace(".ts", ""),
				});
			}
		}
	}

	return foundComposables;
}

type Composable = {
	name: string;
	src: string;
	dist: string;
};
