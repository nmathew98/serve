import { exec } from "child_process";
import Winston from "../logger/logger";
import util from "util";
import findSourceDirectory from "../directory/directory";
import CliColors from "../colors/colors";

export default async function jest(args: string[]) {
	const sourceDirectory = await findSourceDirectory();
	const projectDirectory = sourceDirectory.replace("/src", "/");
	const execPromisified = util.promisify(exec);

	const testProject = `npx jest ${projectDirectory} ${args.join(" ")}`;

	const { stdout, stderr } = await execPromisified(testProject);

	if (stderr) throw new Error(stderr);

	return Winston.log(CliColors.green(stdout));
}
