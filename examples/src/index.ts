import dotenv from "dotenv";
import { initialize, useEntityConfiguration } from "@skulpture/serve";
import mongoose, { Schema } from "mongoose";

initializeProjectConfiguration()
	.then(initializeEntityConfiguration)
	.then(listen);

async function initializeProjectConfiguration() {
	dotenv.config();

	if (process.env.MONGO_URI) {
		const connectionUri: string = process.env.MONGO_URI || "";
		await mongoose.connect(connectionUri);
	}
}

async function initializeEntityConfiguration() {
	useEntityConfiguration(async context => {
		const userSchema = new Schema({
			uuid: {
				type: String,
				required: true,
				unique: true,
			},
			email: {
				type: String,
				required: true,
				unique: true,
			},
			password: {
				type: String,
				required: true,
			},
			puzzle: {
				type: [String],
				required: true,
			},
		});

		const userConfiguration = {
			schema: userSchema,
			model: "User",
		};

		context.set("configuration:User", userConfiguration);
	});
}

async function listen() {
	await initialize();
}
