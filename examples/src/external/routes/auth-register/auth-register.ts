import {
	ServeContext,
	Route,
	GetAuthorization,
	sendError,
	sendSuccess,
	H3,
} from "@skulpture/serve";
import { User, UserRecord } from "../../../entities/user/user";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function register(
	request: H3.IncomingMessage,
	response: H3.ServerResponse,
	context: ServeContext,
) {
	{
		H3.assertMethod(request.event, "POST");

		if (!context.has("User"))
			return sendError(response, "User module not available");

		if (!context.has("Humantic"))
			return sendError(response, "Humantic module not available");

		if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET)
			return sendError(
				response,
				"Access and refresh token secrets are not set",
			);

		if (!context.has("configuration:routes:authorization:get"))
			return sendError(response, "Routes configured incorrectly");
	}

	const getAuthorization: GetAuthorization = context.get(
		"configuration:routes:authorization:get",
	);
	if (typeof getAuthorization !== "function")
		return sendError(response, "Routes configured incorrectly");

	const User: User = context.get("User");
	const findUser = buildFindUser({ User });
	const createUser = buildCreateUser({ User });

	try {
		const body = await H3.useBody(request);

		if (!body.password) return sendError(response, "Invalid user");

		await createUser(body);

		const foundUsers = await findUser({ email: body.email });

		if (!foundUsers) return sendError(response, "Unexpected error occured");

		const user = foundUsers.pop() as UserRecord;

		const accessToken = (await getAuthorization(request, {
			sub: user.uuid,
			secret: ACCESS_TOKEN_SECRET,
			expiresIn: "1 hour",
		})) as string;
		const refreshToken = (await getAuthorization(request, {
			sub: user.uuid,
			secret: REFRESH_TOKEN_SECRET,
			expiresIn: "7 days",
		})) as string;

		response.statusCode = 200;
		H3.setCookie(response.event, "authorization", accessToken, {
			secure: process.env.NODE_ENV === "production",
			maxAge: oneHourFromNow(),
		});
		H3.setCookie(response.event, "refresh", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: sevenDaysFromNow(),
		});

		return sendSuccess(response, `${user.uuid} successfully registered`);
	} catch (error: any) {
		return sendError(response, error.message, error.statusCode);
	}
}

const Register: Route = {
	useRoute: (app, context) =>
		app.use(
			"/auth/register",
			(request: H3.IncomingMessage, response: H3.ServerResponse) =>
				register(request, response, context),
		),
};

export default Register;

function oneHourFromNow() {
	const oneHour = 60 * 60 * Math.pow(10, 3);

	return Date.now() + oneHour;
}

function sevenDaysFromNow() {
	const sevenDays = 7 * 24 * 60 * 60 * Math.pow(10, 3);

	return Date.now() + sevenDays;
}