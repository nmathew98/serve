import type { IncomingMessage } from "h3";

import {
	Authorization,
	SymbolAuthorization,
} from "../../adapters/authorization/authorization";
import { defineMiddleware } from "../middleware";

export default defineMiddleware({
	protected: true,
	use: (config, useModule) => async (req: IncomingMessage) => {
		const Authorization: Authorization = useModule(SymbolAuthorization);

		if (!Authorization) return;

		return await Authorization.verify(req, config?.adapters?.authorization);
	},
});
