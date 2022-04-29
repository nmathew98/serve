import buildMakeSudoku, { Graph } from "./sudoku";

describe("Sudoku", () => {
	let Graph: Graph;
	let makeSudoku: any;

	beforeEach(() => {
		Graph = {
			create: jest.fn(),
			size: jest.fn(),
			addEdge: jest.fn(),
			addNode: jest.fn(),
			setNodeAttribute: jest.fn(),
			getNodeAttribute: jest.fn(),
			clearEdges: jest.fn(),
			mapNodes: jest.fn(),
			neighbors: jest.fn().mockImplementation(() => ["x"]),
		};

		makeSudoku = buildMakeSudoku({ Graph });
	});

	describe("validate", () => {
		const validPuzzle =
			"1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.";
		const invalidLengthPuzzle =
			"1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.1721.";
		const invalidCharactersPuzzle =
			"1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.30.";

		it("throws an error if puzzle is not 81 characters long", () => {
			const sudoku = makeSudoku();

			expect(() => sudoku.validate(invalidLengthPuzzle)).toThrowError(
				"Expected puzzle to be 81 characters long",
			);
		});

		it("throws an error if there are invalid characters in the puzzle", () => {
			const sudoku = makeSudoku();

			expect(() => sudoku.validate(invalidCharactersPuzzle)).toThrowError(
				"Invalid characters in puzzle",
			);
		});

		it("returns true if puzzle is valid", () => {
			const sudoku = makeSudoku();

			const isPuzzleValid = sudoku.validate(validPuzzle);

			expect(isPuzzleValid).toStrictEqual(true);
		});
	});

	describe("isCoordinateValueValid", () => {
		const validPuzzle =
			"1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.";
		const invalidLengthPuzzle =
			"1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.1721.";

		it("throws an error if the puzzle is not valid", () => {
			const sudoku = makeSudoku();

			expect(() =>
				sudoku.isCoordinateValueValid(invalidLengthPuzzle, "A", 1, 7),
			).toThrowError("Expected puzzle to be 81 characters long");
		});

		it("throws an error if the coordinate is invalid", () => {
			const sudoku = makeSudoku();

			expect(() =>
				sudoku.isCoordinateValueValid(validPuzzle, "J", 1, 7),
			).toThrowError("Invalid coordinate");

			expect(() =>
				sudoku.isCoordinateValueValid(validPuzzle, "I", 10, 7),
			).toThrowError("Invalid coordinate");
		});

		it("throws an error if the coordinate value is invalid", () => {
			const sudoku = makeSudoku();

			expect(() =>
				sudoku.isCoordinateValueValid(validPuzzle, "I", 9, 10),
			).toThrowError("Invalid value");
		});
	});

	describe("checkRowPlacement", () => {
		const puzzle =
			"..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";

		it("gets the neighbors of a nodes and checks their color", () => {
			const sudoku = makeSudoku();

			sudoku.checkRowPlacement(puzzle, "A", 1, 7);

			expect(Graph.neighbors).toBeCalledTimes(1);
			expect(Graph.getNodeAttribute).toBeCalledTimes(1);
		});
	});

	describe("checkColPlacement", () => {
		const puzzle =
			"..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";

		it("gets the neighbors of a nodes and checks their color", () => {
			const sudoku = makeSudoku();

			sudoku.checkRowPlacement(puzzle, "A", 1, 7);

			expect(Graph.neighbors).toBeCalledTimes(1);
			expect(Graph.getNodeAttribute).toBeCalledTimes(1);
		});
	});

	describe("checkRegionPlacement", () => {
		const puzzle =
			"..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";

		it("gets the neighbors of a nodes and checks their color", () => {
			const sudoku = makeSudoku();

			sudoku.checkRowPlacement(puzzle, "A", 1, 7);

			expect(Graph.neighbors).toBeCalledTimes(1);
			expect(Graph.getNodeAttribute).toBeCalledTimes(1);
		});
	});

	describe("solve", () => {
		const puzzle =
			"..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
		const invalidLengthPuzzle =
			"1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.1721.";

		it("throws an error if the puzzle is invalid", () => {
			const sudoku = makeSudoku();

			expect(() => sudoku.solve(invalidLengthPuzzle)).toThrowError(
				"Expected puzzle to be 81 characters long",
			);
		});

		it("solves a valid puzzle", () => {
			const sudoku = makeSudoku();

			sudoku.solve(puzzle);

			expect(Graph.create).toBeCalledTimes(1);
			expect(Graph.addNode).toBeCalledTimes(81);
			expect(Graph.setNodeAttribute).toBeCalledTimes(81);
			expect(Graph.neighbors).toBeCalledTimes(81);
			expect(Graph.addEdge).toHaveBeenCalled();
			expect(Graph.getNodeAttribute).toHaveBeenCalled();
			expect(Graph.mapNodes).toHaveBeenCalledTimes(1);
		});
	});
});
