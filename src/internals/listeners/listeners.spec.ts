import { Colors } from "$internals/colors/colors";
import { ServeContext } from "$internals/context/context";
import { Emoji } from "$internals/emoji/emoji";
import { Logger } from "$internals/logger/logger";
import buildMakeListeners, { ListenerMaker } from "./listeners";

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
}));

describe("Listeners", () => {
	let ServeContext: ServeContext;
	let Logger: Logger;
	let Colors: Colors;
	let Emoji: Emoji;
	let makeListeners: ListenerMaker;

	beforeEach(() => {
		const context = Object.create(null);

		ServeContext = {
			set(key, value) {
				context[key] = value;

				return this;
			},
			get: (key: string | symbol): string => {
				return context[key];
			},
			has: (key: string) => {
				return key in context;
			},
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

		makeListeners = buildMakeListeners({ Logger, Colors, Emoji });
	});

	it("throws an error if listener blacklist configuration is not an array", () => {
		ServeContext.set("configuration:listener:blacklist", "wef");

		expect(() => makeListeners(ServeContext)).toThrowError(
			"Listener blacklist must be a string array",
		);
	});

	it("throws an error if listener blacklist configuration is not a string array", () => {
		ServeContext.set("configuration:listener:blacklist", [0, 1, 2, 3]);

		expect(() => makeListeners(ServeContext)).toThrowError(
			"Listener blacklist must be a string array",
		);
	});

	it("loads all listeners which are not blacklisted", async () => {
		/* eslint @typescript-eslint/no-var-requires: "off" */
		const readdirSpy = jest.spyOn(require("fs/promises"), "readdir");

		const listeners = makeListeners(ServeContext);

		await listeners.initialize();
		await listeners.listen();

		expect(readdirSpy).toBeCalledTimes(1);
	});
});
