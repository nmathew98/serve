import {
	BaseRoute,
	H3,
	Route,
	sendError,
	Modules,
	Protected,
	Methods,
	ServeContext,
} from "@skulpture/serve";

@Methods("get")
@Modules("Storage")
@Protected()
@Route("/storage/files/:folder/:file")
export default class StorageFiles extends BaseRoute {
	async use(
		request: H3.IncomingMessage,
		response: H3.ServerResponse,
		context: ServeContext,
	) {
		const Storage = context.get("Storage");

		try {
			const stream = await Storage.stream(request, response);

			return await H3.sendStream(response.event, stream);
		} catch (error: any) {
			return sendError(response, error.message, error?.statusCode);
		}
	}
}
