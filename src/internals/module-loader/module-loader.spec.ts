import { Colors } from "$internals/colors/colors";
import { ServeContext } from "$internals/context/context";
import { Emoji } from "$internals/emoji/emoji";
import { Logger } from "$internals/logger/logger";
import buildMakeModuleLoader, { ModuleLoaderMaker } from "./module-loader";

jest.mock("fs/promises", () => ({
	readdir: jest.fn().mockImplementation(() => [
		{
			isDirectory: () => true,
			name: "a",
		},
		{
			isDirectory: () => true,
			name: "b",
		},
		{
			isDirectory: () => true,
			name: "c",
		},
	]),
	readFile: jest.fn().mockImplementation(() => ({
		toString: () => "",
	})),
}));

describe("ModuleLoader", () => {
	let ServeContext: ServeContext;
	let Logger: Logger;
	let Colors: Colors;
	let Emoji: Emoji;
	let buildMakeA: () => void;
	let buildMakeB: () => void;
	let buildMakeC: () => void;
	let makeModuleLoader: ModuleLoaderMaker;

	beforeEach(() => {
		const context = Object.create(null);

		ServeContext = {
			set: jest.fn().mockImplementation((key, value) => {
				context[key] = value;

				return this;
			}),
			get: jest.fn().mockImplementation((key: string | symbol) => {
				return context[key];
			}),
			has: jest.fn().mockImplementation((key: string) => {
				return key in context;
			}),
		};

		Logger = {
			log: jest.fn(),
			error: jest.fn(),
		};

		Colors = {
			yellow: jest.fn(),
			green: jest.fn(),
			brightGreen: jest.fn(),
			red: jest.fn(),
		};

		Emoji = {
			hourglass: "hourglass",
			whiteCheckMark: "white-check-mark",
			rocket: "rocket",
		};

		buildMakeA = jest.fn().mockImplementation(() => () => {});
		buildMakeB = jest.fn().mockImplementation(() => () => {});
		buildMakeC = jest.fn().mockImplementation(() => () => {});

		makeModuleLoader = buildMakeModuleLoader({ Logger, Colors, Emoji });
	});

	it("throws an error if entity blacklist configuration is not an array", () => {
		ServeContext.set("configuration:entity:blacklist", "wef");

		expect(() => makeModuleLoader(ServeContext)).toThrowError(
			"Entity blacklist must be a string array",
		);
	});

	it("throws an error if entity blacklist configuration is not a string array", () => {
		ServeContext.set("configuration:entity:blacklist", [0, 1, 2, 3]);

		expect(() => makeModuleLoader(ServeContext)).toThrowError(
			"Entity blacklist must be a string array",
		);
	});

	it("loads all entities which are not blacklisted", async () => {
		const mock = {
			import: jest.fn().mockImplementation((path: string) => {
				if (/entities\/a\/a/.test(path)) return { default: buildMakeA };
				else if (/entities\/b\/b/.test(path)) return { default: buildMakeB };
				else return { default: buildMakeC };
			}),
		};

		const moduleLoader = makeModuleLoader(ServeContext, mock);

		await moduleLoader.load();

		expect(buildMakeA).toBeCalledTimes(1);
		expect(buildMakeB).toBeCalledTimes(1);
		expect(buildMakeC).toBeCalledTimes(1);
	});

	it("does not load entities which are blacklisted", async () => {
		const mock = {
			import: jest.fn().mockImplementation((path: string) => {
				if (/entities\/a\/a/.test(path)) return { default: buildMakeA };
				else if (/entities\/b\/b/.test(path)) return { default: buildMakeB };
				else return { default: buildMakeC };
			}),
		};

		ServeContext.set("configuration:entity:blacklist", ["a", "b", "c"]);
		const moduleLoader = makeModuleLoader(ServeContext, mock);

		await moduleLoader.load();

		expect(buildMakeA).toBeCalledTimes(0);
		expect(buildMakeB).toBeCalledTimes(0);
		expect(buildMakeC).toBeCalledTimes(0);
	});
});
