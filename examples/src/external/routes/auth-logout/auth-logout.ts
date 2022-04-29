import { BaseRoute, H3, Route, sendSuccess } from "@skulpture/serve";

@Route("/auth/logout", ["delete"])
export default class Logout extends BaseRoute {
	use(_: H3.IncomingMessage, response: H3.ServerResponse) {
		H3.deleteCookie(response.event, "authorization");
		H3.deleteCookie(response.event, "refresh");

		return sendSuccess(response, "Log out successful");
	}
}
