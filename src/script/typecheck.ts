/* eslint no-console: "off" */

import { spawn } from "child_process";
import { NodeEmoji } from "..";
import CliColors from "../colors/colors";
import generateComposableDeclarations from "../composables/composables";
import { findRootDirectory } from "../directory/directory";

export default async function typecheck(args: string[]) {
	const projectDirectory = await findRootDirectory();

	console.log(CliColors.yellow("Checking types ..."), NodeEmoji.hourglass);

	await generateComposableDeclarations();

	const typecheck = spawn("npx tsc", ["--noEmit", ...args], {
		stdio: "inherit",
		cwd: projectDirectory,
		shell: true,
	});

	typecheck.on("error", error => {
		console.error(CliColors.red("Error while checking types"));
		console.error(CliColors.red(error.message));

		if (error.stack) console.error(CliColors.red(error.stack));
	});

	typecheck.on("close", code => {
		if (!code) {
			console.log(
				CliColors.brightGreen("Looks good"),
				NodeEmoji.whiteCheckMark,
			);
		}
	});
}
