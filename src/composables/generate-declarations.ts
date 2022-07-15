import { writeFile } from "fs/promises";
import createFolder from "./create-folder";
import { findComposables } from "./find-composables";
import findRootDirectory from "./find-root-directory";
import { Logger as Consola } from "../adapters/logger/logger";

export default async function generateDeclarations() {
	Consola.log(`Generating composable declarations ...`);

	const rootDirectory = await findRootDirectory();

	const composables = await findComposables();

	let declarations = "declare global {";
	for (const composable of composables)
		declarations += `\n\tconst build${composable.name}: typeof import('${composable.src}')['default']`;

	declarations += "\n}";
	declarations += "\nexport {}";

	await createFolder(`${rootDirectory}/src/serve/types`);

	await writeFile(
		`${rootDirectory}/src/serve/types/composables.d.ts`,
		declarations,
		{ flag: "w+" },
	);

	Consola.success(`Generated composable declarations`);
}
