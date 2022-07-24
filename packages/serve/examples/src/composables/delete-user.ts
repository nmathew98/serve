import { User, UserRecord } from "../entities/user/user";

export default function buildDeleteUser({ User }: { User: User }) {
	return async function deleteUser(user: Pick<UserRecord, "uuid">) {
		await User.delete({ uuid: user.uuid });
	};
}
