import { User, UserRecord } from "@entities/user/user";
import { Sudoku } from "@entities/sudoku/sudoku";

export default function buildSolvePuzzle({
	User,
	Sudoku,
}: {
	User: User;
	Sudoku: Sudoku;
}) {
	return async function solvePuzzle(
		puzzle: string,
		user: Pick<UserRecord, "uuid">,
	) {
		const solved = Sudoku.solve(puzzle);

		const foundUsers = await User.find({ uuid: user.uuid });

		if (!foundUsers || foundUsers.length === 0 || foundUsers.length > 1)
			throw new Error("Invalid user");

		const foundUser = foundUsers.pop();

		await User.update(
			{ uuid: user.uuid },
			{ puzzle: [...(foundUser?.puzzle as string[]), solved.join("")] },
		);

		return solved;
	};
}
