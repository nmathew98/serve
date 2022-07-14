import type { IncomingMessage } from "h3";

import type { Authorization } from "../../adapters/authorization/authorization";
import { defineMiddleware } from "../middleware";

export default defineMiddleware({
	use: (config, useModule) => async (req: IncomingMessage) => {
		const Authorization: Authorization = useModule("Authorization");

		if (!Authorization) return;

		return await Authorization.verify(req, config?.adapters?.authorization);
	},
});
