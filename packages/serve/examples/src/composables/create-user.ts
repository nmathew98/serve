import { User, UserRecord } from "../entities/user/user";

export default function buildCreateUser({ User }: { User: User }) {
	return async function createUser(user: UserRecord) {
		const uuid = await User.save(user);

		return !!uuid;
	};
}
