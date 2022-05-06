import { spawn } from "child_process";
import Consola from "../adapters/logger/logger";
import { resolve as resolvePath } from "path";

export default async function installPackage(
	name: string,
	development = false,
) {
	return new Promise((resolve, reject) => {
		const mode = !development ? "-S" : "-D";

		Consola.log(`Installing package ${name} ...`);
		const npm = spawn(`npm i ${mode} ${name}`, {
			stdio: "ignore",
			shell: true,
			cwd: resolvePath(__dirname),
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
