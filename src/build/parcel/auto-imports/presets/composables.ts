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
			const imported = await import(x);

			const composableName = getComposableName(x);
			if (imported[composableName]) {
				const location = getLocation(x);

				const existing = preset.get(location) ?? [];

				preset.set(location, [...existing, composableName]);
			}
		}
	}

	return preset;
};

const getLocation = (path: string) =>
	path.replace(".ts", "").replace(".js", "");

const getComposableName = (path: string) => {
	const regex = /\w*.ts|\/\w*.js/;
	const file = path.match(regex)?.pop();

	const composableName = `build-${file?.replace(".ts", "").replace(".js", "")}`
		.split("-")
		.map((word, index) => {
			if (index === 0) return word.toLowerCase();

			const normalized = word.toLowerCase();

			return `${normalized.charAt(0).toUpperCase()}${normalized
				.slice(1)
				.toLowerCase()}`;
		})
		.join("");

	return composableName;
};
