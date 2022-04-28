/* eslint no-console: "off" */

import { spawn } from "child_process";
import { resolve } from "path";
import CliColors from "../adapters/colors/colors";
import { findRootDirectory } from "../utilities/directory/directory";

export default async function jest(args: string[]) {
	const projectDirectory = await findRootDirectory();

	const jestConfigFile = resolve(__dirname, "../../jest.config.js");

	const jest = spawn(
		"npx jest",
		[
			`${projectDirectory}/src`,
			...args,
			"--config",
			jestConfigFile,
			"--roots",
			`${projectDirectory}`,
		],
		{
			stdio: "inherit",
			cwd: projectDirectory,
			shell: true,
		},
	);

	jest.on("error", error => {
		console.error(CliColors.red("Error while running jest"));
		console.error(CliColors.red(error.message));

		if (error.stack) console.error(CliColors.red(error.stack));
	});
}
