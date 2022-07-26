import type { IncomingMessage } from "h3";

import type { Authorization } from "../../adapter/types/authorization/authorization";
import { SymbolAuthorization } from "../../adapter/types/authorization/authorization";
import { defineMiddleware } from "../middleware";

export default defineMiddleware({
	protected: true,
	use: (config, useModule) => async (req: IncomingMessage) => {
		const [Authorization] = useModule<Authorization>(SymbolAuthorization);

		if (!Authorization) return;

		return await Authorization.verify(req, config?.adapters?.authorization);
	},
});
