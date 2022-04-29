import { IncomingMessage, ServerResponse } from "h3";
import { Upload } from "../../adapters/upload/upload";
import { ServeContext } from "../../listeners/context/context";
import { sendSuccess, sendError, VerifyAuthorization } from "../utilities";
import { BaseRoute, Route } from "../route";

@Route("/storage/remove", ["post"])
export default class StorageRemove extends BaseRoute {
	async use(
		request: IncomingMessage,
		response: ServerResponse,
		context: ServeContext,
	) {
		if (!context.has("configuration:adapter:upload"))
			return sendError(response, "Storage module not available");

		{
			let verifyAuthorization: VerifyAuthorization;
			let verifyAuthorizationOptions: Record<string, any> | undefined;

			if (context.has("configuration:routes:authorization:verify")) {
				if (context.has("configuration:routes:storage:verify")) {
					const verificationOptionsInContext = context.get(
						"configuration:routes:storage:verify",
					);

					if (typeof verificationOptionsInContext === "object")
						verifyAuthorizationOptions = verificationOptionsInContext;
				}

				verifyAuthorization = context.get(
					"configuration:routes:authorization:verify",
				);

				if (typeof verifyAuthorization === "function") {
					try {
						await verifyAuthorization(request, verifyAuthorizationOptions);
					} catch (error: any) {
						return sendError(response, error.message, error.statusCode);
					}
				}
			}
		}

		const upload: Upload = context.get("configuration:adapter:upload");
		const fileRemoveHandler = upload.remove;

		try {
			return sendSuccess(response, await fileRemoveHandler(request, response));
		} catch (error: any) {
			return sendError(response, error.message, error?.statusCode);
		}
	}
}
