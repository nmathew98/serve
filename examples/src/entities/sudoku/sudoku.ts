export interface Sudoku {
	validate: (puzzle: string) => boolean;
	checkRowPlacement: (
		puzzle: string,
		row: string,
		column: string,
		value: number,
	) => boolean;
	checkColPlacement: (
		puzzle: string,
		row: string,
		column: string,
		value: number,
	) => boolean;
	checkRegionPlacement: (
		puzzle: string,
		row: string,
		column: string,
		value: number,
	) => boolean;
	solve: (puzzle: string) => string;
}

export default function buildMakeSudoku({ Graph }: { Graph: Graph }) {
	return function makeSudoku() {
		return;
	};
}

export interface Graph {
	create: () => any;
	addEdge: (x: number, y: number) => void;
	addNode: (node: number, attributes: Record<string, any>) => void;
	setNodeAttribute: (node: number, attribute: string, value: number) => void;
	clearEdges: () => void;
	neighbors: (node: number) => number[];
}
