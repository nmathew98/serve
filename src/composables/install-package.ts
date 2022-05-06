import { spawn } from "child_process";
import Consola from "../adapters/logger/logger";
import { resolve as resolvePath } from "path";
import findRootDirectory from "./find-root-directory";

export default async function installPackage({
	name,
	development = false,
	internal = true,
}: {
	name: string;
	development?: boolean;
	internal?: boolean;
}) {
	const projectDirectory = await findRootDirectory();
	const serveDirectory = resolvePath(__dirname, "../../");

	return new Promise((resolve, reject) => {
		const mode = !development ? "-S" : "-D";

		Consola.log(`Installing package ${name} ...`);
		const npm = spawn(`npm i ${mode} ${name}`, {
			stdio: "ignore",
			shell: true,
			cwd: internal ? serveDirectory : projectDirectory,
		});

		npm.on("close", () => {
			Consola.success(`Package ${name} installed successfully`);
			resolve(true);
		});

		npm.on("error", () => {
			reject(new Error(`Unable to install ${name}`));
		});
	});
}
