import { Logger } from "../adapter/internal/logger/logger";

export const defineComposable = (composable: Composable) => async () => {
	const composableName = composable.name;
	if (!composable.name) return Logger.error("Composables must be named");

	(global as any)[composableName] = composable;
	Logger.success(`✅ Loaded composable ${composableName}`);
};

type Composable = (deps: Record<string, any>) => (...args: any[]) => any;
