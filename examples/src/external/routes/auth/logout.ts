import { BaseRoute, H3, Methods, Route, sendSuccess } from "@skulpture/serve";

@Methods("delete")
@Route("/auth/logout")
export default class Logout extends BaseRoute {
	use(_: H3.IncomingMessage, response: H3.ServerResponse) {
		H3.deleteCookie(response.event, "authorization");
		H3.deleteCookie(response.event, "refresh");

		return sendSuccess(response, "Log out successful");
	}
}
