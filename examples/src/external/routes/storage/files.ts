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
@Modules("Upload")
@Protected({
	accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
	refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
})
@Route("/storage/files/:folder/:file")
export default class StorageFiles extends BaseRoute {
	async use(
		request: H3.IncomingMessage,
		response: H3.ServerResponse,
		context: ServeContext,
	) {
		const Upload = context.get("Upload");

		try {
			const stream = await Upload.stream(request, response);

			return await H3.sendStream(response.event, stream);
		} catch (error: any) {
			return sendError(response, error.message, error?.statusCode);
		}
	}
}
