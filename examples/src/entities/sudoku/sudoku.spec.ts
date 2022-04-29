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
			neighbors: jest.fn(),
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
});
