import { User } from "@entities/user/user";
import { ServeContext, doesModuleExist } from "@skulpture/serve";
import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { Sudoku } from "@entities/sudoku/sudoku";

export default function setUser(context: ServeContext) {
	doesModuleExist(context, "Logger", "User");

	const User: User = context.get("User");
	const Sudoku: Sudoku = context.get("Sudoku");

	const solvePuzzle = buildSolvePuzzle({ User, Sudoku });

	return Object.freeze({
		solvePuzzle: {
			type: GraphQLString,
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLID),
				},
				puzzle: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve: async (_: any, { uuid, puzzle }: SolvePuzzleArguments) =>
				await solvePuzzle(puzzle, { uuid }),
		},
	});
}

interface SolvePuzzleArguments {
	uuid: string;
	puzzle: string;
}
