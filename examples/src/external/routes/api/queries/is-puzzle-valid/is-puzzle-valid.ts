import { ServeContext, doesModuleExist, gql } from "@skulpture/serve";
import { Sudoku } from "@entities/sudoku/sudoku";

export default function setUser(context: ServeContext) {
	doesModuleExist(context, "Logger", "Sudoku");

	const Sudoku: Sudoku = context.get("Sudoku");

	const isPlacementValid = buildIsPlacementValid({ Sudoku });
	const isPuzzleValid = buildIsPuzzleValid({ Sudoku });

	return {
		definition:
			"isPuzzleValid(row: String, column: Int, value: Int, puzzle: String!): IsPuzzleValid",
		types: gql`
			type IsPuzzleValid {
				placement: Boolean
				puzzle: Boolean
			}
		`,
		resolve: {
			isPuzzleValid: async (
				_: any,
				{ puzzle, row, column, value }: IsPuzzleValidArguments,
			) => {
				let placementValid: boolean | null = null;

				if (puzzle && row && column && value)
					placementValid = isPlacementValid(puzzle, row, column, value);

				const puzzleValid = isPuzzleValid(puzzle);

				return {
					placement: placementValid,
					puzzle: puzzleValid,
				};
			},
		},
	};
}

interface IsPuzzleValidArguments {
	puzzle: string;
	row: string;
	column: number;
	value: number;
}
