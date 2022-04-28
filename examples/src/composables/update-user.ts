import { User, UserRecord } from "../entities/user/user";

export default function buildUpdateUser({ User }: { User: User }) {
	return async function updateUser(
		identifiers: Partial<UserRecord>,
		user: Partial<UserRecord>,
	) {
		return await User.update(identifiers, user);
	};
}
