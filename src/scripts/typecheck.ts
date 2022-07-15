import { spawn } from "child_process";
import { Logger as Consola } from "../adapters/logger/logger";
import findRootDirectory from "../composables/find-root-directory";
import generateDeclarations from "../composables/generate-declarations";

export default async function typecheck(args: string[]) {
	const projectDirectory = await findRootDirectory();

	Consola.log("Checking types ...");

	try {
		await generateDeclarations();

		const typecheck = spawn("npx tsc", ["--noEmit", ...args], {
			stdio: "inherit",
			cwd: projectDirectory,
			shell: true,
		});

		typecheck.on("error", error => {
			Consola.error("Error while checking types");

			if (error.stack) Consola.error(error.stack);
		});

		typecheck.on("close", async code => {
			if (!code) {
				try {
					await generateDeclarations();
				} catch (error: any) {
					Consola.error(error.message);
				}

				Consola.success("Looks good");
			}
		});
	} catch (error: any) {
		Consola.error(error.message);
	}
}
