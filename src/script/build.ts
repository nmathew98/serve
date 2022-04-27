import { spawn } from "child_process";
import { resolve } from "path";
import CliColors from "../colors/colors";
import { findRootDirectory } from "../directory/directory";
import Winston from "../logger/logger";

export default async function build(args: string[]) {
	const projectDirectory = await findRootDirectory();

	const output = process.env.OUTPUT_DIRECTORY ?? "dist";

	const swcConfigPath = resolve(__dirname, "../../.swcrc");

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
		Winston.error(CliColors.red("Error while building project!"));
		Winston.error(CliColors.red(error.message));

		if (error.stack) Winston.error(CliColors.red(error.stack));
	});

	build.on("close", code => {
		if (!code) {
			const cp = spawn("cp", [`./package.json`, `./${output}/package.json`], {
				stdio: "inherit",
				cwd: projectDirectory,
				shell: true,
			});

			cp.on("close", code => {
				if (!code) {
					args.forEach(script => `node ${script}`, {
						stdio: "inherit",
						cwd: projectDirectory,
						shell: true,
					});
				}
			});
		}
	});
}
