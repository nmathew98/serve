import clc from "cli-color";

export interface Colors {
	/**
	 * Print yellow text in the console
	 */
	yellow: (...args: string[]) => string;

	/**
	 * Print green text in the console
	 */
	green: (...args: string[]) => string;

	/**
	 * Print bright green text in the console
	 */
	brightGreen: (...args: string[]) => string;

	/**
	 * Print red text in the console
	 */
	red: (...args: string[]) => string;
}

const CliColors: Colors = {
	yellow: (...args: string[]) => clc.yellow(args),
	green: (...args: string[]) => clc.green(args),
	brightGreen: (...args: string[]) => clc.greenBright(args),
	red: (...args: string[]) => clc.red(args),
};

export default CliColors;
