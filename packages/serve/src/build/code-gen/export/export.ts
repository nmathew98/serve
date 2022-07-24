import { readFile } from "fs/promises";

import { isImportable } from "../../../utilities/is-importable";
import { ls } from "../../../utilities/ls";

export const traverseDirsAndReexport = async (
	path: string | string[],
	format: ExportFormat,
) => {
	const dirsToTraverse = [];
	if (Array.isArray(path)) dirsToTraverse.push(...path);
	else dirsToTraverse.push(path);

	const files = [];
	for (const dir of dirsToTraverse) {
		for await (const file of ls(dir)) {
			if (isImportable(file)) files.push(file);
		}
	}

	const pathAndContents = await Promise.all(
		files.map(async file => ({
			path: file,
			code: (await readFile(file)).toString(),
		})),
	);

	const exportDefault = /export\s+default\s+/gim;
	const filesWithDefaultExports = pathAndContents
		.filter(x => exportDefault.test(x.code))
		.map(
			(x, index) =>
				`export { default as ${format.toUpperCase()}_${index} } from "${
					x.path
				}"`,
		)
		.join("\n");

	return filesWithDefaultExports;
};

export type ExportFormat =
	| "adapter"
	| "entity"
	| "composable"
	| "plugin"
	| "middleware"
	| "schemaDef"
	| "route";
