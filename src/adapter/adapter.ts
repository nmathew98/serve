import { Logger } from "./internal/logger/logger";
import { moduleStore, useStore } from "../utilities/store";
import { ServeConfig } from "../serve/serve";

export const defineAdapter =
	(builder: AdapterBuilder) => async (config: ServeConfig) => {
		const adapterName = builder.name.replaceAll(/buildMake|build/g, "");

		const [, setAdapter] = useStore(adapterName, moduleStore);

		setAdapter(builder(config));

		Logger.success(`✅ Loaded adapter ${adapterName}`);
	};

type AdapterBuilder = (config: ServeConfig) => Record<string, any>;
