import passport from "passport";
import passportLocal from "passport-local";
import Hasher from "../../adapters/hasher/hasher";
import { User, UserRecord } from "../../../entities/user/user";
import buildFindUser from "../../../composables/find-user";
import {
	Route,
	GetAuthorization,
	sendError,
	sendSuccess,
	RouteError,
	ServeContext,
	H3,
} from "@skulpture/serve";

const LocalStategy = passportLocal.Strategy;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function login(
	request: H3.IncomingMessage,
	response: H3.ServerResponse,
	context: ServeContext,
) {
	{
		H3.assertMethod(request.event, "POST");

		if (!context.has("Humantic"))
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

	try {
		const user = (await passportAuthenticatePromisified(
			request,
			response,
		)) as UserRecord;

		const body = await H3.useBody(request);

		const accessToken = (await getAuthorization(request, {
			sub: user.uuid,
			secret: ACCESS_TOKEN_SECRET,
			expiresIn: body.rememberMe ? "1 hour" : "7 days",
		})) as string;
		const refreshToken = (await getAuthorization(request, {
			sub: user.uuid,
			secret: REFRESH_TOKEN_SECRET,
			expiresIn: "7 days",
		})) as string;

		response.statusCode = 200;
		H3.setCookie(response.event, "authorization", accessToken, {
			secure: process.env.NODE_ENV === "production",
			maxAge: body.rememberMe ? oneHourFromNow() : sevenDaysFromNow(),
		});
		H3.setCookie(response.event, "refresh", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: sevenDaysFromNow(),
		});

		return sendSuccess(response, `${user.uuid} successfully authenticated`);
	} catch (error: any) {
		return sendError(response, error.message, error.statusCode);
	}
}

const Login: Route = {
	useRoute: (app, context) => {
		passport.use(
			new LocalStategy(
				{ usernameField: "email", passwordField: "password" },
				async (
					email: string,
					password: string,
					done: (error: any, user?: Partial<UserRecord>) => void,
				) => {
					if (!context.has("User"))
						return done(new RouteError("User module not available", 500));

					const User: User = context.get("User");
					const findUser = buildFindUser({ User });

					try {
						const users = await findUser({ email });

						if (!users || users.length > 1)
							return done(new RouteError("Invalid email/password", 401));

						const user = users.pop() as UserRecord;
						const isUserValid = await Hasher.verify(password, user?.password);

						if (!isUserValid)
							return done(new RouteError("Invalid email/password", 401));

						const result = { ...user } as Record<string, any>;
						delete result.password;

						return done(null, result);
					} catch (error: any) {
						return done(new RouteError(error.message, 500));
					}
				},
			),
		);

		app.use(
			"/auth/login",
			(request: H3.IncomingMessage, response: H3.ServerResponse) =>
				login(request, response, context),
		);
	},
};

export default Login;

function oneHourFromNow() {
	const oneHour = 60 * 60 * Math.pow(10, 3);

	return Date.now() + oneHour;
}

function sevenDaysFromNow() {
	const sevenDays = 7 * 24 * 60 * 60 * Math.pow(10, 3);

	return Date.now() + sevenDays;
}

function passportAuthenticatePromisified(
	request: H3.IncomingMessage,
	response: H3.ServerResponse,
): Promise<Partial<UserRecord> | undefined> {
	return new Promise((resolve, reject) => {
		H3.useBody(request).then(body => {
			if (typeof body !== "object")
				return reject(new RouteError("Invalid request"));
			if (!body.email || !body.password)
				return reject(new RouteError("Invalid request"));

			passport.authenticate(
				"local",
				(error: any, user?: Partial<UserRecord>) => {
					if (error) return reject(error);

					return resolve(user);
				},
			)({ ...request.req, body }, response.res);
		});
	});
}
