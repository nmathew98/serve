import { Sudoku } from "../entities/sudoku/sudoku";

export default function buildIsPuzzleValid({ Sudoku }: { Sudoku: Sudoku }) {
	return function isPuzzleValid(puzzle: string) {
		return Sudoku.validate(puzzle);
	};
}
