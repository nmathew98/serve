import { IncomingMessage, ServerResponse } from "h3";
import { Upload } from "../../upload/upload";
import { ServeContext } from "../../context/context";
import { sendSuccess, sendError } from "../utilities";
import { Route } from "../route";

async function upload(
	request: IncomingMessage,
	response: ServerResponse,
	context: ServeContext,
) {
	if (!context.has("configuration:routes:storage:upload"))
		return sendError(response, "Storage module not available");

	{
		let verifyAuthorization: any;
		let verifyAuthorizationOptions: any;

		if (context.has("configuration:routes:verify")) {
			if (context.has("configuration:routes:storage:verify")) {
				const verificationOptionsInContext = context.get(
					"configuration:routes:storage:verify",
				);

				if (typeof verificationOptionsInContext === "object")
					verifyAuthorizationOptions = verificationOptionsInContext;
				else verifyAuthorizationOptions = Object.create(null);
			} else verifyAuthorizationOptions = Object.create(null);

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

	const Upload: Upload = context.get("configuration:routes:storage:upload");
	const fileUploadHandler = Upload.handle;

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
