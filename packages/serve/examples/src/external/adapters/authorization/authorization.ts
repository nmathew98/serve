import { Authorization, H3 } from "@skulpture/serve";
import { sign, verify } from "jsonwebtoken";

const AuthorizationSecrets = Object.freeze({
	accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
	refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
});

const Authorization: Authorization = {
	get: async (request, options?) => {
		if (options && options.sub && options.secret && options.expiresIn) {
			return await signPromisified(
				{ sub: options.sub },
				options.secret,
				options.expiresIn,
			);
		} else throw new Error("No options provided");
	},

	verify: async (request, options = AuthorizationSecrets) => {
		const accessToken = H3.useCookie(request, "authorization");
		const refreshToken = H3.useCookie(request, "refresh");

		if (!accessToken || !refreshToken) throw new Error("Token(s) are invalid");

		if (options && options.accessTokenSecret && options.refreshTokenSecret) {
			const accessTokenDecoded = await verifyPromisified(
				accessToken,
				options.accessTokenSecret,
			);
			const refreshTokenDecoded = await verifyPromisified(
				refreshToken,
				options.refreshTokenSecret,
			);

			return {
				accessTokenDecoded: accessTokenDecoded,
				refreshTokenDecoded: refreshTokenDecoded,
			};
		} else throw new Error("No options provided");
	},
};

export default Authorization;
export { AuthorizationSecrets };

function verifyPromisified(
	token: string,
	secret: string,
): Promise<string | void> {
	return new Promise((resolve, reject) => {
		verify(token, secret, (error: any, decoded: any) => {
			if (error) return reject(new Error("Token(s) are invalid"));

			return resolve(decoded.sub);
		});
	});
}

function signPromisified(
	options: Record<string, any>,
	secret: string,
	expiresIn: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		sign(options, secret, { expiresIn }, (error: any, token: any) => {
			if (error) return reject(new Error("Unexpected error occured"));

			return resolve(token);
		});
	});
}
