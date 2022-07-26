import cors from "cors";

import { defineMiddleware } from "../middleware";

export default defineMiddleware({
	use: config => cors(config?.middleware?.cors),
});
