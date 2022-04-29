export interface Sudoku {
	validate: (puzzle: string) => boolean;
	isCoordinateValid: (
		puzzle: string,
		row: string,
		column: number,
		value: number,
	) => boolean;
	checkRowPlacement: (
		puzzle: string,
		row: string,
		column: number,
		value: number,
	) => boolean;
	checkColPlacement: (
		puzzle: string,
		row: string,
		column: number,
		value: number,
	) => boolean;
	checkRegionPlacement: (
		puzzle: string,
		row: string,
		column: number,
		value: number,
	) => boolean;
	solve: (puzzle: string) => number[];
}

export default function buildMakeSudoku({ Graph }: { Graph: Graph }) {
	const graph = Graph.create({
		allowSelfLoops: false,
		multi: true,
		type: "undirected",
	});

	const rows: number[][] = [];
	for (let i = 0; i < 9; i++) {
		const row: number[] = [];
		for (let j = 0; j < 9; j++) row.push(i * (9 + j));

		rows.push(row);
	}

	const columns: number[][] = (rows[0] as number[]).map((_, column) =>
		rows.map(row => row[column] as number),
	);

	const createSudokuGraph = (puzzle: string) => {
		const nodeIdAndColors = puzzle
			.split("")
			.map(value => (value === "." ? 0 : ~value));

		addNodesToGraph(nodeIdAndColors);
	};

	const addNodesToGraph = (nodeIdAndColors: number[]) => {
		nodeIdAndColors.forEach((color, index) => {
			if (!Graph.size(graph))
				Graph.addNode(
					index,
					{
						color: nodeIdAndColors[index],
					},
					graph,
				);
			else Graph.setNodeAttribute(index, "color", color, graph);
		});

		if (Graph.size(graph)) Graph.clearEdges(graph);
	};

	const connectNodesInRow = () => {
		rows.forEach(row =>
			row.forEach(x =>
				row.forEach(y => {
					if (x !== y) Graph.addEdge(x, y, graph);
				}),
			),
		);
	};

	const connectNodesInColumn = () => {
		columns.forEach(column =>
			column.forEach(x =>
				column.forEach(y => {
					if (x !== y) Graph.addEdge(x, y, graph);
				}),
			),
		);
	};

	const connectNodesInRegion = () => {
		const regions = [
			[0, 1, 2, 9, 10, 11, 18, 19, 20],
			[3, 4, 5, 12, 13, 14, 21, 22, 23],
			[6, 7, 8, 15, 16, 17, 24, 25, 26],
			[27, 28, 29, 36, 37, 38, 45, 46, 47],
			[30, 31, 32, 39, 40, 41, 48, 49, 50],
			[33, 34, 35, 42, 43, 44, 51, 52, 53],
			[54, 55, 56, 63, 64, 65, 72, 73, 74],
			[57, 58, 59, 66, 67, 68, 75, 76, 77],
			[60, 61, 62, 69, 70, 71, 78, 79, 80],
		];

		regions.forEach(region => {
			region.forEach(x => {
				region.forEach(y => {
					if (x !== y) Graph.addEdge(x, y, graph);
				});
			});
		});
	};

	const colorGraph = (node: number = 0) => {
		const setNodeColor = (node: number, color: number) =>
			Graph.setNodeAttribute(node, "color", color, graph);

		const clearNodeColor = (node: number) =>
			Graph.setNodeAttribute(node, "color", 0, graph);

		const nodeColor = Graph.getNodeAttribute(node, "color", graph);
		if (nodeColor > 0 && node < 80) {
			colorGraph(node + 1);

			return true;
		}

		for (let color = 1; color < 10; color++) {
			if (isValidColor(node, color)) {
				setNodeColor(node, color);

				if (node < 80)
					if (colorGraph(node + 1)) return true;
					else clearNodeColor(node);
				else return true;
			}
		}

		return false;
	};

	const isValidColor = (node: number, color: number) => {
		const getNodeColor = (node: number) =>
			Graph.getNodeAttribute(node, "color", graph);

		const neighbors = Graph.neighbors(node, graph);

		for (const neighbor of neighbors)
			if (getNodeColor(neighbor) === color) return true;

		return true;
	};

	return function makeSudoku(): Sudoku {
		return Object.freeze({
			validate: puzzle => {
				if (puzzle.length !== 81)
					throw new Error("Expected puzzle to be 81 characters long");

				const validCharacters = /^[.1-9]{81}$/g;

				if (!validCharacters.test(puzzle))
					throw new Error("Invalid characters in puzzle");

				return true;
			},
			isCoordinateValid(puzzle: string, row, column, value) {
				this.validate(puzzle);

				const getCharCode = (char: string) => char.toUpperCase().charCodeAt(0);

				if (column <= 0 || column > 9 || getCharCode(row) > getCharCode("I"))
					throw new Error("Invalid coordinate");

				if (value <= 0 || value > 9) throw new Error("Invalid value");

				return true;
			},
			checkRowPlacement(puzzle, row, column, value) {
				this.validate(puzzle);
				createSudokuGraph(puzzle);

				const rowMappings = Object.create(null);
				for (let i = 0; i < 9; i++)
					rowMappings[String.fromCharCode(65 + i)] = i * 9;

				const node = rowMappings[row.toUpperCase()] + (column - 1);

				connectNodesInRow();

				return isValidColor(node, value);
			},
			checkColPlacement(puzzle, row, column, value) {
				this.validate(puzzle);
				createSudokuGraph(puzzle);

				const rowMappings = Object.create(null);
				for (let i = 0; i < 9; i++)
					rowMappings[String.fromCharCode(65 + i)] = i * 9;

				const node = rowMappings[row.toUpperCase()] + (column - 1);

				connectNodesInColumn();

				return isValidColor(node, value);
			},
			checkRegionPlacement(puzzle, row, column, value) {
				this.validate(puzzle);
				createSudokuGraph(puzzle);

				const rowMappings = Object.create(null);
				for (let i = 0; i < 9; i++)
					rowMappings[String.fromCharCode(65 + i)] = i * 9;

				const node = rowMappings[row.toUpperCase()] + (column - 1);

				connectNodesInRegion();

				return isValidColor(node, value);
			},
			solve(puzzle) {
				this.validate(puzzle);

				createSudokuGraph(puzzle);
				connectNodesInRegion();
				connectNodesInRow();
				connectNodesInColumn();

				colorGraph();

				let hasEmptyPositions = false;
				const solvedPuzzle = Graph.mapNodes((_, attributes) => {
					if (attributes.color && attributes.color === 0)
						hasEmptyPositions = true;

					return attributes.color;
				});

				if (hasEmptyPositions) throw new Error("Puzzle cannot be solved");

				return solvedPuzzle;
			},
		});
	};
}

export interface Graph<T = any> {
	create: (options: Record<string, any>) => T;
	size: (graph: T) => number;
	addEdge: (x: number, y: number, graph: T) => void;
	addNode: (node: number, attributes: Record<string, any>, graph: T) => void;
	setNodeAttribute: (
		node: number,
		attribute: string,
		value: number,
		graph: T,
	) => void;
	getNodeAttribute: (node: number, attribute: string, graph: T) => number;
	clearEdges: (graph: T) => void;
	neighbors: (node: number, graph: T) => number[];
	mapNodes: (
		callback: (node: number, attributes: Record<string, any>) => any,
	) => any[];
}
