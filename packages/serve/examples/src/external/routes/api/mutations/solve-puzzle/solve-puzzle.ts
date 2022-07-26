import { User } from "@entities/user/user";
import { ServeContext, doesModuleExist } from "@skulpture/serve";
import { Sudoku } from "@entities/sudoku/sudoku";

export default function setUser(context: ServeContext) {
	doesModuleExist(context, "Logger", "User");

	const User: User = context.get("User");
	const Sudoku: Sudoku = context.get("Sudoku");

	const solvePuzzle = buildSolvePuzzle({ User, Sudoku });

	return {
		definition: "solvePuzzle(uuid: ID!, puzzle: String!): String!",
		resolver: {
			solvePuzzle: async (_: any, { uuid, puzzle }: SolvePuzzleArguments) =>
				await solvePuzzle(puzzle, { uuid }),
		},
	};
}

interface SolvePuzzleArguments {
	uuid: string;
	puzzle: string;
}
