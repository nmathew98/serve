import mongoose, { Schema, Model } from "mongoose";

const Database = {
	use: (schema: any, model: any) => {
		return mongoose.model(model, schema as Schema);
	},

	create: async (document: any, model: Model<any>) => {
		return model.create(document);
	},

	find: async (identifiers: any, model: Model<any>) => {
		let result;
		if (identifiers._id) {
			result = await model
				.findById(identifiers._id)
				.setOptions({ sanitizeProjection: true })
				.exec();

			return result;
		}

		result = await model
			.findOne(identifiers)
			.setOptions({ sanitizeProjection: true })
			.exec();

		return result;
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
