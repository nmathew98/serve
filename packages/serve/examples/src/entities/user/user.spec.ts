import buildMakeUser, {
	Database,
	Hasher,
	UserRecord,
	Uuid,
	Validator,
} from "./user";

describe("User", () => {
	let Database: Database;
	let Hasher: Hasher;
	let Uuid: Uuid;
	let Validator: Validator;
	let makeUser: any;

	beforeEach(() => {
		const users = ["x", "y", "z"];

		Database = {
			use: jest.fn(),
			create: jest.fn().mockImplementation(() => Object.create(null)),
			findAll: jest
				.fn()
				.mockImplementation((identifiers: Partial<UserRecord>) => {
					if (identifiers.uuid)
						if (users.includes(identifiers.uuid))
							return [{ uuid: identifiers.uuid }];

					return null;
				}),
			update: jest.fn(),
			delete: jest.fn().mockImplementation(() => 1),
		};

		Hasher = {
			hash: jest.fn().mockImplementation((password: string) => password),
		};

		Uuid = {
			get: jest.fn().mockImplementation(() => "a"),
		};

		Validator = {
			isEmailValid: jest
				.fn()
				.mockImplementation((email: string) => /@/.test(email)),
			isPasswordValid: jest
				.fn()
				.mockImplementation((password: string) => /[A-Za-z]/.test(password)),
		};

		makeUser = buildMakeUser({ Database, Hasher, Uuid, Validator });
	});

	describe("makeUser", () => {
		it("uses a specified model and schema", async () => {
			makeUser({ schema: {}, model: "User" });

			expect(Database.use).toBeCalledTimes(1);
		});
	});

	describe("find", () => {
		it("returns null if there are no matching users", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			const result = await user.find({});

			expect(Database.findAll).toBeCalledTimes(1);
			expect(result).toStrictEqual(null);
		});

		it("returns an array of matching users", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			const result = await user.find({ uuid: "x" });

			expect(Database.use).toBeCalledTimes(1);
			expect(Database.findAll).toBeCalledTimes(1);

			expect(Array.isArray(result)).toStrictEqual(true);
		});
	});

	describe("save", () => {
		it("throws an error if email is invalid", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			try {
				await user.save({ email: "test" });
			} catch (error: any) {
				expect(error.message).toStrictEqual("Email is not valid");
				expect(Database.create).toBeCalledTimes(0);
				expect(Hasher.hash).toBeCalledTimes(0);
				expect(Uuid.get).toBeCalledTimes(0);
			}
		});

		it("throws an error if username is invalid", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			try {
				await user.save({
					username: "12345",
					email: "test@example.com",
				});
			} catch (error: any) {
				expect(error.message).toStrictEqual("Username is not valid");
				expect(Database.create).toBeCalledTimes(0);
				expect(Hasher.hash).toBeCalledTimes(0);
				expect(Uuid.get).toBeCalledTimes(0);
			}
		});

		it("throws an error if password is invalid", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			try {
				await user.save({
					username: "abcdef",
					email: "test@example.com",
					password: "12345",
				});
			} catch (error: any) {
				expect(error.message).toStrictEqual("Password is not valid");
				expect(Database.create).toBeCalledTimes(0);
				expect(Hasher.hash).toBeCalledTimes(0);
				expect(Uuid.get).toBeCalledTimes(0);
			}
		});

		it("creates a user record if fields are valid", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			const result = await user.save({
				username: "abcdef",
				email: "test@example.com",
				password: "abcdef",
			});

			expect(result).toStrictEqual("a");
			expect(Database.create).toBeCalledTimes(1);
			expect(Hasher.hash).toBeCalledTimes(1);
			expect(Uuid.get).toBeCalledTimes(1);
		});
	});

	describe("update", () => {
		it("throws an error if uuid is not specified", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			try {
				await user.update(Object.create(null), {
					email: "test@example.com",
					username: "abcdef",
					password: "abcdef",
				});
			} catch (error: any) {
				expect(error.message).toStrictEqual("UUID must be specified");
			}
		});

		it("throws an error if email is not valid", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			try {
				await user.update(
					{ uuid: "x" },
					{ email: "test", username: "abcdef", password: "abcdef" },
				);
			} catch (error: any) {
				expect(error.message).toStrictEqual("Email is not valid");
			}
		});

		it("throws an error if password is not valid", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			try {
				await user.update(
					{ uuid: "x" },
					{ email: "test@example.com", username: "test", password: "1234" },
				);
			} catch (error: any) {
				expect(error.message).toStrictEqual("Password is not valid");
			}
		});

		it("does not update if there are no fields to update", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			const result = await user.update({ uuid: "x" }, {});

			expect(Database.update).toBeCalledTimes(0);
			expect(result).toStrictEqual(true);
		});

		it("updates a user if fields are valid", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			const result = await user.update(
				{ uuid: "x" },
				{ email: "test@example.com", username: "test" },
			);

			expect(result).toStrictEqual(true);
			expect(Database.update).toBeCalledTimes(1);
		});

		it("hashes the password if password is updated", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			const result = await user.update(
				{ uuid: "x" },
				{ email: "test@example.com", username: "test", password: "abcdef" },
			);

			expect(result).toStrictEqual(true);
			expect(Database.update).toBeCalledTimes(1);
			expect(Hasher.hash).toBeCalledTimes(1);
		});

		it("removes the uuid if it is provided as an update", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			const result = await user.update(
				{ uuid: "x" },
				{
					uuid: "y",
					email: "test@example.com",
					username: "test",
					password: "abcdef",
				},
			);

			expect(result).toStrictEqual(true);
			expect(Database.update).toBeCalledTimes(1);
			expect(Hasher.hash).toBeCalledTimes(1);
			expect(Database.update).toHaveBeenCalledWith(
				{ uuid: "x" },
				{
					email: "test@example.com",
					username: "test",
					password: "abcdef",
				},
				undefined,
			);
		});
	});

	describe("delete", () => {
		it("throws an error if uuid is not specified", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			try {
				await user.delete({});
			} catch (error: any) {
				expect(error.message).toStrictEqual("UUID must be specified");
			}
		});

		it("returns the number of records deleted", async () => {
			const user = makeUser({ schema: {}, model: "User" });

			const result = await user.delete({ uuid: "x" });

			expect(result).toStrictEqual(1);
			expect(Database.delete).toBeCalledTimes(1);
		});
	});
});
