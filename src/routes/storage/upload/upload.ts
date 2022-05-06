import { IncomingMessage, ServerResponse } from "h3";
import { Storage } from "../../../adapters/storage/storage";
import { ServeContext } from "../../../listeners/context/context";
import { sendSuccess, sendError } from "../../utilities";
import { BaseRoute } from "../../route";
import { Methods } from "../../../composables/decorators/methods";
import { Modules } from "../../../composables/decorators/modules";
import { Route } from "../../../composables/decorators/route";

@Methods("post")
@Modules("Storage")
@Route("/storage/upload")
export default class StorageUpload extends BaseRoute {
	// @ts-expect-error Only used by the decorator
	private protected = true;

	constructor(config: Record<string, any>) {
		super();

		this.protected = !!config.routes.api.protect;
	}

	async use(
		request: IncomingMessage,
		response: ServerResponse,
		context: ServeContext,
	) {
		const Storage: Storage = context.get("Storage");

		try {
			return sendSuccess(response, await Storage.upload(request, response));
		} catch (error: any) {
			return sendError(response, error.message, error?.statusCode, context);
		}
	}
}
