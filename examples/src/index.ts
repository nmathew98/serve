import dotenv from "dotenv";
import {
	initialize,
	useEntityConfiguration,
	useScripts,
} from "@skulpture/serve";
import mongoose, { Schema } from "mongoose";
import syncData from "./external/scripts/sync-data";

initializeProjectConfiguration()
	.then(initializeEntityConfiguration)
	.then(initializeScripts)
	.then(listen);

async function initializeProjectConfiguration() {
	dotenv.config();

	const connectionUri: string = process.env.MONGO_URI || "";

	await mongoose.connect(connectionUri);
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

		context.set("configuration:Sudoku", sudokuConfiguration);
		context.set("configuration:Puzzle", puzzleConfiguration);
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
