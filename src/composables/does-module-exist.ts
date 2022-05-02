import { ServeContext } from "../listeners/context/context";

export default function doesModuleExist(
	context: ServeContext,
	...moduleNames: string[]
) {
	for (const moduleName of moduleNames)
		if (!context.has(moduleName))
			throw new Error(`${moduleName} module not found`);
}
