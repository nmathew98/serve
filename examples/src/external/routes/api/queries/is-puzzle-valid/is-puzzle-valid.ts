import { ServeContext, doesModuleExist } from "@skulpture/serve";
import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString,
} from "graphql";
import { Sudoku } from "@entities/sudoku/sudoku";

export default function setUser(context: ServeContext) {
	doesModuleExist(context, "Logger", "Sudoku");

	const Sudoku: Sudoku = context.get("Sudoku");

	const isPlacementValid = buildIsPlacementValid({ Sudoku });
	const isPuzzleValid = buildIsPuzzleValid({ Sudoku });

	return Object.freeze({
		isPuzzleValid: {
			type: new GraphQLObjectType({
				name: "IsPuzzleValid",
				fields: () => ({
					placement: {
						type: GraphQLBoolean,
					},
					puzzle: {
						type: GraphQLBoolean,
					},
				}),
			}),
			args: {
				row: {
					type: GraphQLString,
				},
				column: {
					type: GraphQLInt,
				},
				value: {
					type: GraphQLInt,
				},
				puzzle: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve: async (
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
	});
}

interface IsPuzzleValidArguments {
	puzzle: string;
	row: string;
	column: number;
	value: number;
}
