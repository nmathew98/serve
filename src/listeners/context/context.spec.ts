import makeContext, { ServeContext } from "./context";

let context: ServeContext;

describe("Context", () => {
	beforeEach(() => {
		context = makeContext();
	});

	it("should throw an error if a key is not available", () => {
		try {
			context.get("x");
		} catch (error: any) {
			expect(error.message).toStrictEqual("No such key available!");
		}
	});

	it("should return false if a key is not available", () => {
		expect(context.has(Symbol("x"))).toStrictEqual(false);
	});

	it("should add a key to the context", () => {
		context.set("x", "y");

		expect(context.get("x")).toStrictEqual("y");
	});

	it("should have one global context object", () => {
		expect(context.get("x")).toStrictEqual("y");
	});
});
