import type { CompatibilityEventHandler } from "h3";
import helmet from "helmet";

import { defineMiddleware } from "../middleware";

export default defineMiddleware({
	use: config =>
		helmet(config?.middleware?.helmet) as CompatibilityEventHandler,
});
