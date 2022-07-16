import { Logger } from "./internal/logger/logger";
import { moduleStore, useStore } from "../utilities/store";

export const defineAdapter = (builder: AdapterBuilder) => async () => {
	const adapterName = builder.name.replaceAll(/buildMake|build/g, "");

	// @ts-expect-error: its still being used as it will be set in the store
	let adapter = useStore(adapterName, moduleStore);

	adapter = builder();

	Logger.success(`✅ Loaded adapter ${adapterName}`);
};

type AdapterBuilder = () => Record<string, any>;
