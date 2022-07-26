import { readFile } from "fs/promises";
import { isImportable } from "../../../../utilities/is-importable";
import { ls } from "../../../../utilities/ls";
import { findRootDir } from "../../../../utilities/root-dir";
import { AutoImportPreset } from "../auto-import";

export const createComposablesPreset = async () => {
	const preset: AutoImportPreset = new Map();

	const rootDir = findRootDir();
	const composables = `${rootDir}/src/composables`;

	for await (const x of ls(composables)) {
		if (isImportable(x)) {
			const exportStatementsRegex =
				/export\s+\w*\s+(\w*)|export\s+{\s*\w*\s*}/gim;
			const composableReplaceRegex = /export\s+\w*|{|}|\s*/gim;
			const extractComposableName = (match: string) =>
				match.replace(composableReplaceRegex, "");
			const addComposableToPreset = (match: string) => {
				const location = getLocation(x);
				const existing = preset.get(location) ?? [];

				preset.set(location, [...existing, match]);
			};

			const buffer = await readFile(x);
			const code = buffer.toString();

			code
				.match(exportStatementsRegex)
				?.map(extractComposableName)
				.forEach(addComposableToPreset);
		}
	}

	return preset;
};

const getLocation = (path: string) =>
	path.replace(".ts", "").replace(".js", "");
