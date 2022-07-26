import { Validator as UserValidator } from "@entities/user/user";
import * as EmailValidator from "email-validator";
import PasswordValidator from "password-validator";
import mongoose from "mongoose";

const Validator: UserValidator = {
	isPasswordValid: async (password: any) => {
		const schema = new PasswordValidator();

		schema
			.is()
			.min(8)
			.has()
			.uppercase()
			.has()
			.lowercase()
			.has()
			.digits(1)
			.has()
			.not()
			.spaces();

		const result = schema.validate(password) as boolean;

		return result;
	},
	isEmailValid: async (email: any) => {
		const isEmailFormatValid = EmailValidator.validate(email);

		if (isEmailFormatValid) {
			const User = mongoose.model("User");

			const foundUsers = await User.find({ email })
				.setOptions({ sanitizeProjection: true })
				.exec();

			return !foundUsers || foundUsers.length === 0;
		}

		return false;
	},
};

export default Validator;
