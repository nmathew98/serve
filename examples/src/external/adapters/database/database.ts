import mongoose, { Schema, Model } from "mongoose";
import { Database as UserDatabase } from "@entities/user/user";

const Database: UserDatabase = {
	use: (schema: any, model: any) => {
		return mongoose.model(model, schema as Schema);
	},
	create: async (document: any, model: Model<any>) => {
		return model.create(document);
	},
	findAll: async (identifiers: any, model: Model<any>) => {
		const result = await model
			.find(identifiers)
			.setOptions({ sanitizeProjection: true })
			.exec();

		if (!result || !result.length) return null;

		return result;
	},

	update: async (identifiers: any, updates: any, model: Model<any>) => {
		const result = await model.updateMany(identifiers, updates);

		return result.modifiedCount;
	},

	delete: async (identifiers: any, model: Model<any>) => {
		const result = await model.deleteMany(identifiers);

		return result.deletedCount;
	},
};

export default Database;
