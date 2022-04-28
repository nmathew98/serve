export interface User {
	find: (identifiers: Partial<UserRecord>) => Promise<UserRecord[] | null>;
	save: (user: UserRecord) => Promise<string>;
	update: (
		identifiers: Partial<UserRecord>,
		updates: Partial<UserRecord>,
	) => Promise<boolean>;
	delete: (identifiers: Partial<UserRecord>) => Promise<number>;
}

export interface UserConfiguration {
	schema: Record<string, any>;
	model: string;
}

export default function buildMakeUser({
	Database,
	Hasher,
	Uuid,
	Validator,
}: {
	Database: Database;
	Hasher: Hasher;
	Uuid: Uuid;
	Validator: Validator;
}) {
	return function makeUser(configuration: UserConfiguration): User {
		const model = Database.use(configuration.schema, configuration.model);

		return Object.freeze({
			find: async identifiers => {
				const foundUsers = await Database.findAll(identifiers, model);

				if (!foundUsers) return null;

				return foundUsers.map((document: Record<string, any>) => ({
					_id: document._id,
					email: document.email,
					password: document.password,
					uuid: document.uuid,
				}));
			},
			save: async user => {
				if (!(await Validator.isEmailValid(user.email)))
					throw new Error("Email is not valid");

				if (!(await Validator.isPasswordValid(user.password)))
					throw new Error("Password is not valid");

				const uuid = Uuid.get();
				await Database.create(
					{
						...user,
						password: await Hasher.hash(user.password),
						uuid,
					},
					model,
				);

				return uuid;
			},
			update: async (identifiers, updates) => {
				if (!identifiers.uuid) throw new Error("UUID must be specified");

				if (!Object.keys(updates).length) return true;

				if (updates.email)
					if (!(await Validator.isEmailValid(updates.email)))
						throw new Error("Email is not valid");

				if (updates.password)
					if (!(await Validator.isPasswordValid(updates.password)))
						throw new Error("Password is not valid");

				const updatesToRecord = { ...updates };

				if (updatesToRecord.password)
					updatesToRecord.password = await Hasher.hash(
						updatesToRecord.password,
					);

				if (updatesToRecord.uuid) delete updatesToRecord.uuid;

				await Database.update(identifiers, updatesToRecord, model);

				return true;
			},
			delete: async identifiers => {
				if (!identifiers.uuid) throw new Error("UUID must be specified");

				const deleteCount = await Database.delete(identifiers, model);

				return deleteCount;
			},
		});
	};
}

export interface UserRecord {
	_id: string;
	email: string;
	password: string;
	uuid?: string;
}

export interface Database {
	use: (schema: Record<string, any>, model: string) => any;
	create: (
		document: Record<string, any>,
		model: any,
	) => Promise<Record<string, any>>;
	findAll: (
		identifiers: Record<string, any>,
		model: any,
	) => Promise<Record<string, any>[] | null>;
	update: (
		identifiers: Record<string, any>,
		updates: Record<string, any>,
		model: any,
	) => Promise<number>;
	delete: (identifiers: Record<string, any>, model: any) => Promise<number>;
}

export interface Hasher {
	hash: (value: string) => Promise<string>;
}

export interface Uuid {
	get: () => string;
}

export interface Validator {
	isEmailValid: (email: string) => Promise<boolean>;
	isPasswordValid: (password: string) => Promise<boolean>;
}
