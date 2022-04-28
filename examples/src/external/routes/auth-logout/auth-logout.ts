import { H3, Route, sendSuccess } from "@skulpture/serve";

async function logout(
	request: H3.IncomingMessage,
	response: H3.ServerResponse,
) {
	H3.assertMethod(request, "DELETE");

	H3.deleteCookie(response.event, "authorization");
	H3.deleteCookie(response.event, "refresh");

	return sendSuccess(response, "Log out successful");
}

const Logout: Route = {
	useRoute: app =>
		app.use(
			"/auth/logout",
			(request: H3.IncomingMessage, response: H3.ServerResponse) =>
				logout(request, response),
		),
};

export default Logout;
