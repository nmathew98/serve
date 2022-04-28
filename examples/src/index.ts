import dotenv from "dotenv";
import {
	initialize,
	useServeConfiguration,
	useEntityConfiguration,
	useScripts,
	RouteError,
	GetAuthorization,
	VerifyAuthorization,
	H3,
} from "@skulpture/serve";
import mongoose, { Schema } from "mongoose";
import syncData from "./external/scripts/sync-data";
import { verify, sign } from "jsonwebtoken";
import Upload from "./external/adapters/upload/upload";

initializeProjectConfiguration()
	.then(initializeServeConfiguration)
	.then(initializeEntityConfiguration)
	.then(initializeScripts)
	.then(listen);

async function initializeProjectConfiguration() {
	dotenv.config();

	const connectionUri: string = process.env.MONGO_URI || "";

	await mongoose.connect(connectionUri);
}

async function initializeServeConfiguration() {
	useServeConfiguration(async context => {
		context.set("configuration:cors", {
			origin: (
				origin: string,
				callback: (error: Error | null, origin: string | boolean) => void,
			) => {
				const allowedOrigins: string[] = ["http://localhost:3000"];
				if (allowedOrigins.includes(origin)) return callback(null, origin);

				return callback(null, false);
			},
			credentials: true,
		});

		context.set("configuration:helmet", {
			crossOriginResourcePolicy: {
				policy: "same-site",
			},
		});

		context.set("configuration:adapter:upload", Upload);

		const verifyAuthorization: VerifyAuthorization = async (
			request,
			payload?,
		) => {
			const accessToken = H3.useCookie(request, "authorization");
			const refreshToken = H3.useCookie(request, "refresh");

			if (!accessToken || !refreshToken)
				throw new RouteError("Token(s) are invalid", 401);

			if (payload && payload.accessTokenSecret && payload.refreshTokenSecret) {
				const accessTokenDecoded = await verifyPromisified(
					accessToken,
					payload.accessTokenSecret,
				);
				const refreshTokenDecoded = await verifyPromisified(
					refreshToken,
					payload.refreshTokenSecret,
				);

				return {
					accessTokenDecoded: accessTokenDecoded,
					refreshTokenDecoded: refreshTokenDecoded,
				};
			} else throw new RouteError("No payload provided", 500);
		};
		context.set(
			"configuration:routes:authorization:verify",
			verifyAuthorization,
		);

		const getAuthorization: GetAuthorization = async (_, payload?) => {
			if (payload && payload.sub && payload.secret && payload.expiresIn) {
				return await signPromisified(
					{ sub: payload.sub },
					payload.secret,
					payload.expiresIn,
				);
			} else throw new RouteError("No payload provided", 500);
		};
		context.set("configuration:routes:authorization:get", getAuthorization);

		const tokenSecrets = Object.freeze({
			accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
			refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
		});
		context.set("configuration:routes:api:verify", tokenSecrets);
		context.set("configuration:routes:storage:verify", tokenSecrets);

		function verifyPromisified(
			token: string,
			secret: string,
		): Promise<string | void> {
			return new Promise((resolve, reject) => {
				verify(token, secret, (error: any, decoded: any) => {
					if (error) return reject(new RouteError("Token(s) are invalid", 401));

					return resolve(decoded.sub);
				});
			});
		}

		function signPromisified(
			payload: Record<string, any>,
			secret: string,
			expiresIn: string,
		): Promise<string> {
			return new Promise((resolve, reject) => {
				sign(payload, secret, { expiresIn }, (error: any, token: any) => {
					if (error)
						return reject(new RouteError("Unexpected error occured", 500));

					return resolve(token);
				});
			});
		}
	});
}

async function initializeEntityConfiguration() {
	useEntityConfiguration(async context => {
		const sudokuSchema = new Schema({});
		const puzzleSchema = new Schema({});

		const sudokuConfiguration = {
			schema: sudokuSchema,
			model: "Sudoku",
		};
		const puzzleConfiguration = {
			schema: puzzleSchema,
			model: "Puzzle",
		};

		context.set("configuration:entity:Sudoku", sudokuConfiguration);
		context.set("configuration:entity:Puzzle", puzzleConfiguration);
	});
}

async function initializeScripts() {
	useScripts(async context => {
		await syncData(context);
	});
}

async function listen() {
	await initialize();
}
