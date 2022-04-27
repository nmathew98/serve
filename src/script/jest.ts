import { spawn } from "child_process";
import CliColors from "../colors/colors";
import { findRootDirectory } from "../directory/directory";

export default async function jest(args: string[]) {
	const projectDirectory = await findRootDirectory();

	const jest = spawn("npx jest", [`${projectDirectory}/src`, ...args], {
		stdio: "inherit",
		cwd: projectDirectory,
		shell: true,
	});

	jest.on("error", error => {
		/* eslint no-console: "off" */
		console.error(CliColors.red("Error while running Jest!"));
		console.error(CliColors.red(error.message));

		if (error.stack) console.error(CliColors.red(error.stack));
	});
}
