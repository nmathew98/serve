import { Transformer } from "@parcel/plugin";

import { createComposablesPreset } from "./presets/composables";
import { createServePreset } from "./presets/serve";

export default new Transformer({
	transform: async ({ asset }) => {
		const code = await asset.getCode();
		const presets = await Promise.all([
			createServePreset(),
			createComposablesPreset(),
		]);

		presets.forEach(preset =>
			preset.forEach((es, loc) => {
				es.filter(e => code.includes(e)).forEach(e => {
					asset.addDependency({
						specifier: `import {${e}} from "${loc}"`,
						specifierType: "esm",
					});
				});
			}),
		);

		return [asset];
	},
});

export type AutoImportPreset = Map<string, string[]>;
