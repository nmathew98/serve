import { spawn } from "child_process";
import { resolve } from "path";
import { Logger as Consola } from "../adapters/logger/logger";
import findRootDirectory from "../composables/find-root-directory";
import generateDeclarations from "../composables/generate-declarations";
import isPathValid from "../composables/is-path-valid";

export default async function build(args: string[]) {
	const projectDirectory = await findRootDirectory();

	const projectSwcConfig = resolve(projectDirectory, "./.swcrc");
	const localSwcConfig = resolve(__dirname, "../../.swcrc");
	const doesProjectHaveSwcConfig = await isPathValid(projectSwcConfig);

	const swcConfigPath = doesProjectHaveSwcConfig
		? projectSwcConfig
		: localSwcConfig;

	const output = "dist";

	const projectDetails: { name: string; version: string } = await import(
		`${projectDirectory}/package.json`
	);

	Consola.log(`Building ${projectDetails.name}@${projectDetails.version} ...`);

	const build = spawn(
		"npx swc",
		[
			"./src",
			"-d",
			output,
			"--delete-dir-on-start",
			"--copy-files",
			"--config-file",
			swcConfigPath,
		],
		{
			stdio: "inherit",
			cwd: projectDirectory,
			shell: true,
		},
	);

	build.on("error", error => {
		Consola.error("Error while building project");
		Consola.error(error.message);

		if (error.stack) Consola.error(error.stack);

		process.exit(1);
	});

	build.on("close", async code => {
		if (!code) {
			await generateDeclarations();

			Consola.success(`Built ${projectDetails.name}@${projectDetails.version}`);

			Consola.log("Copying project details ...");

			const cp = spawn("cp", [`./package.json`, `./${output}/package.json`], {
				stdio: "inherit",
				cwd: projectDirectory,
				shell: true,
			});

			cp.on("close", code => {
				if (!code) {
					Consola.success("Copied project details");

					if (args && args.length) {
						Consola.log("Running postinstall scripts ...");

						args.forEach(script => {
							Consola.log(`Running ${script} ...`);

							const spawnedInstance = spawn(`node ${script}`, {
								stdio: "inherit",
								cwd: projectDirectory,
								shell: true,
							});

							spawnedInstance.on("close", code => {
								if (!code) Consola.success(`Ran script ${script}`);
							});

							spawnedInstance.on("error", error => {
								Consola.error(`Error while running ${script}`);
								Consola.error(error.message);

								if (error.stack) Consola.error(error.stack);

								process.exit(1);
							});
						});
					}
				}
			});

			cp.on("error", error => {
				Consola.error("Error copying project details");
				Consola.error(error.message);

				if (error.stack) Consola.error(error.stack);

				process.exit(1);
			});
		}
	});
}
