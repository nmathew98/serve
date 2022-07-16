import { Logger } from "./internal/logger/logger";
import { moduleStore, useStore } from "../utilities/store";

export const defineAdapter = (builder: AdapterBuilder) => async () => {
	const adapterName = builder.name.replaceAll(/buildMake|build/g, "");

	const [, setAdapter] = useStore(adapterName, moduleStore);

	setAdapter(builder());

	Logger.success(`✅ Loaded adapter ${adapterName}`);
};

type AdapterBuilder = () => Record<string, any>;
