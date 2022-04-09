import { IncomingMessage, ServerResponse } from "h3";
import { Upload } from "../../upload/upload";
import { ServeContext } from "../../context/context";
import { sendSuccess, sendError, VerifyAuthorization } from "../utilities";
import { Route } from "../route";

async function remove(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	if (!context.has("configuration:adapter:upload"))
		return sendError(response, "Storage module not available");

	{
		let verifyAuthorization: VerifyAuthorization;
		let verifyAuthorizationOptions: Record<string, any> | undefined;

		if (context.has("configuration:routes:verify")) {
			if (context.has("configuration:routes:storage:verify")) {
				const verificationOptionsInContext = context.get(
					"configuration:routes:storage:verify",
				);

				if (typeof verificationOptionsInContext === "object")
					verifyAuthorizationOptions = verificationOptionsInContext;
			}

			verifyAuthorization = context.get("configuration:storage:verify");

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
		return sendSuccess(response, await fileRemoveHandler(request));
	} catch (error: any) {
		return sendError(response, error.message, error?.statusCode);
	}
}

const StorageRemove: Route = {
	useRoute: (app, context) => {
		let path: string;

		if (context.has("configuration:routes:storage:remove:path"))
			path = context.get("configuration:routes:storage:remove:path");
		else path = "/storage/remove";

		app.use(path, (request: IncomingMessage, response: ServerResponse) =>
			remove(request, response, context),
		);
	},
};

export default StorageRemove;
