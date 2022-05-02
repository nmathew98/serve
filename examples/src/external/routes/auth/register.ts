import {
	ServeContext,
	Route,
	sendError,
	sendSuccess,
	H3,
	BaseRoute,
	Methods,
	Modules,
	Authorization,
} from "@skulpture/serve";
import { User, UserRecord } from "../../../entities/user/user";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

@Methods("post")
@Modules("User")
@Route("/auth/register")
export default class Register extends BaseRoute {
	async use(
		request: H3.IncomingMessage,
		response: H3.ServerResponse,
		context: ServeContext,
	) {
		const Authorization: Authorization = context.get("Authorization");

		try {
			const User: User = context.get("User");
			const findUser = buildFindUser({ User });
			const createUser = buildCreateUser({ User });

			const body = await H3.useBody(request);

			if (!body.password) return sendError(response, "Invalid user");

			await createUser(body);

			const foundUsers = await findUser({ email: body.email });

			if (!foundUsers) return sendError(response, "Unexpected error occured");

			const user = foundUsers.pop() as UserRecord;

			const accessToken = (await Authorization.get(request, {
				sub: user.uuid,
				secret: ACCESS_TOKEN_SECRET,
				expiresIn: "1 hour",
			})) as string;
			const refreshToken = (await Authorization.get(request, {
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
}

function oneHourFromNow() {
	const oneHour = 60 * 60 * Math.pow(10, 3);

	return Date.now() + oneHour;
}

function sevenDaysFromNow() {
	const sevenDays = 7 * 24 * 60 * 60 * Math.pow(10, 3);

	return Date.now() + sevenDays;
}
