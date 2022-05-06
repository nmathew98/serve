import { spawn } from "child_process";
import { resolve } from "path";
import Consola from "../adapters/logger/logger";
import findRootDirectory from "../composables/find-root-directory";

export default async function update(args: string[]) {
	const serveDirectory = resolve(__dirname, "../../");
	const projectDirectory = await findRootDirectory();

	switch (args[0]) {
		case "check":
			{
				Consola.log("Checking package versions ...");

				const allowedPackages = [
					"@swc/jest",
					"jest",
					"@sentry/node",
					"@sentry/tracing",
				];

				spawn(`npx --yes npm-check-updates -f ${allowedPackages.join(" ")}`, {
					stdio: "inherit",
					cwd: serveDirectory,
					shell: true,
				});
				spawn("npx --yes npm-check-updates", {
					stdio: "inherit",
					cwd: projectDirectory,
					shell: true,
				});
			}
			break;
		case "semver":
			{
				Consola.log("Updating packages (respecting SemVer) ...");

				spawn("npm update @swc/jest jest@latest @sentry/node @sentry/tracing", {
					stdio: "inherit",
					cwd: serveDirectory,
					shell: true,
				});
				spawn("npm update", {
					stdio: "inherit",
					cwd: projectDirectory,
					shell: true,
				});
			}
			break;
		case "force":
			{
				Consola.log("Updating packages (force) ...");

				const inServe = spawn(
					"npx --yes npm-check-updates -u -f @swc/jest jest @sentry/node @sentry/tracing",
					{
						stdio: "ignore",
						cwd: serveDirectory,
						shell: true,
					},
				);
				const inProject = spawn("npx --yes npm-check-updates -u", {
					stdio: "ignore",
					cwd: projectDirectory,
					shell: true,
				});

				inServe.on("close", () => {
					spawn("npm i", {
						stdio: "inherit",
						cwd: serveDirectory,
						shell: true,
					});
				});

				inProject.on("close", () => {
					spawn("npm i", {
						stdio: "inherit",
						cwd: projectDirectory,
						shell: true,
					});
				});
			}
			break;
	}
}
