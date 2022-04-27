/* eslint no-console: "off" */

import { spawn } from "child_process";
import { resolve } from "path";
import { NodeEmoji } from "..";
import CliColors from "../colors/colors";
import { findRootDirectory } from "../directory/directory";

export default async function build(args: string[]) {
	const projectDirectory = await findRootDirectory();

	const output = process.env.OUTPUT_DIRECTORY ?? "dist";

	const swcConfigPath = resolve(__dirname, "../../.swcrc");

	const projectDetails: { name: string; version: string } = await import(
		`${projectDirectory}/package.json`
	);

	console.log(
		CliColors.green(
			`Building ${projectDetails.name}@${projectDetails.version} ...`,
		),
	);

	const build = spawn(
		"npx swc",
		["./src", "-d", output, "--config-file", swcConfigPath],
		{
			stdio: "inherit",
			cwd: projectDirectory,
			shell: true,
		},
	);

	build.on("error", error => {
		console.error(
			CliColors.red("Error while building project"),
			NodeEmoji.hourglass,
		);
		console.error(CliColors.red(error.message));

		if (error.stack) console.error(CliColors.red(error.stack));

		process.exit(1);
	});

	build.on("close", code => {
		if (!code) {
			console.log(
				CliColors.brightGreen(
					`Built ${projectDetails.name}@${projectDetails.version}`,
				),
				NodeEmoji.whiteCheckMark,
			);

			console.log(
				CliColors.yellow("Copying project details ..."),
				NodeEmoji.hourglass,
			);

			const cp = spawn("cp", [`./package.json`, `./${output}/package.json`], {
				stdio: "inherit",
				cwd: projectDirectory,
				shell: true,
			});

			cp.on("close", code => {
				if (!code) {
					console.log(
						CliColors.brightGreen("Copied project details"),
						NodeEmoji.whiteCheckMark,
					);

					console.log(
						CliColors.yellow("Running postinstall scripts ..."),
						NodeEmoji.hourglass,
					);

					args.forEach(script => {
						console.log(
							CliColors.yellow(`Running ${script} ...`),
							NodeEmoji.hourglass,
						);

						const spawnedInstance = spawn(`node ${script}`, {
							stdio: "inherit",
							cwd: projectDirectory,
							shell: true,
						});

						spawnedInstance.on("close", code => {
							if (!code) {
								console.log(
									CliColors.brightGreen(`Ran script ${script}`),
									NodeEmoji.whiteCheckMark,
								);
							}
						});

						spawnedInstance.on("error", error => {
							console.error(CliColors.red(`Error while running ${script}`));
							console.error(CliColors.red(error.message));

							if (error.stack) console.error(CliColors.red(error.stack));

							process.exit(1);
						});
					});
				}
			});

			cp.on("error", error => {
				console.error(CliColors.red("Error copying project details"));
				console.error(CliColors.red(error.message));

				if (error.stack) console.error(CliColors.red(error.stack));

				process.exit(1);
			});
		}
	});
}
