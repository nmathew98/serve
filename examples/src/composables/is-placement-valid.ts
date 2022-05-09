import { Sudoku } from "../entities/sudoku/sudoku";

export default function buildIsPlacementValid({ Sudoku }: { Sudoku: Sudoku }) {
	return function isPlacementValid(
		puzzle: string,
		row: string,
		column: number,
		value: number,
	) {
		const isRowPlacementValid = Sudoku.checkRowPlacement(
			puzzle,
			row,
			column,
			value,
		);
		const isColumnPlacementValid = Sudoku.checkColPlacement(
			puzzle,
			row,
			column,
			value,
		);
		const isRegionPlacementValid = Sudoku.checkRegionPlacement(
			puzzle,
			row,
			column,
			value,
		);

		return (
			isRowPlacementValid && isColumnPlacementValid && isRegionPlacementValid
		);
	};
}
