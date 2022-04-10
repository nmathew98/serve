import { IncomingMessage, assertMethod, ServerResponse } from "h3";
import { Upload } from "../../upload/upload";
import { ServeContext } from "../../context/context";
import { sendSuccess, sendError, VerifyAuthorization } from "../utilities";
import { Route } from "../route";

async function upload(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	assertMethod(request.event, "POST");

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
	const fileUploadHandler = upload.handle;

	try {
		return sendSuccess(response, await fileUploadHandler(request));
	} catch (error: any) {
		return sendError(response, error.message, error?.statusCode);
	}
}

const StorageUpload: Route = {
	useRoute: (app, context) => {
		let path: string;

		if (context.has("configuration:routes:storage:upload:path"))
			path = context.get("configuration:routes:storage:upload:path");
		else path = "/storage/upload";

		app.use(path, (request: IncomingMessage, response: ServerResponse) =>
			upload(request, response, context),
		);
	},
};

export default StorageUpload;
