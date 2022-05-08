import { spawn } from "child_process";
import { resolve } from "path";
import { copyFile, unlink } from "fs/promises";
import Consola from "../adapters/logger/logger";
import findRootDirectory from "../composables/find-root-directory";
import isPackageInstalled from "../composables/is-package-installed";
import installPackage from "../composables/install-package";

export default async function jest(args: string[]) {
	const requiredPackages = ["jest", "@swc/jest"];

	for (const pkg of requiredPackages) {
		const isInstalled = await isPackageInstalled({
			name: pkg,
		});

		if (!isInstalled)
			await installPackage({
				name: pkg,
				development: true,
			});
	}

	const projectDirectory = await findRootDirectory();

	const jestConfigFile = resolve(__dirname, "../../jest.config.js");

	await copyFile(jestConfigFile, `${projectDirectory}/.jest.config.js`);

	const jest = spawn(
		"npx jest",
		["/src", ...args, "--config", `${projectDirectory}/.jest.config.js`],
		{
			stdio: "inherit",
			cwd: projectDirectory,
			shell: true,
		},
	);

	jest.on("close", async () => {
		try {
			await unlink(`${projectDirectory}/.jest.config.js`);
		} catch (error: any) {
			Consola.error(error.message);
		}
	});

	jest.on("error", error => {
		Consola.error("Error while running jest");
		Consola.error(error.message);

		if (error.stack) Consola.error(error.stack);
	});
}
