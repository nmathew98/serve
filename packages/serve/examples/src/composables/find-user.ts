import { User, UserRecord } from "../entities/user/user";

export default function buildFindUser({ User }: { User: User }) {
	return async function findUser(user: Partial<UserRecord>) {
		const userRecords = await User.find(user);

		if (!userRecords || !(userRecords.length >= 1)) return null;

		return userRecords;
	};
}
