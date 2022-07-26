import { AutoImportPreset } from "../auto-import";
import * as serve from "../../../../index";

export const createServePreset = async () => {
	const preset: AutoImportPreset = new Map();

	const es = Object.keys(serve);

	preset.set("@skulpture/serve", es);

	return preset;
};
