import { exec } from "child_process";
import Winston from "../logger/logger";
import util from "util";
import findSourceDirectory from "../directory/directory";
import CliColors from "../colors/colors";

export default async function build() {
	const sourceDirectory = await findSourceDirectory();
	const projectDirectory = sourceDirectory.replace("/src", "");
	const execPromisified = util.promisify(exec);

	const output = process.env.OUTPUT_DIRECTORY ?? "dist";
	const compileProject = `npx swc ${projectDirectory} -d ${projectDirectory}/${output}`;

	const { stdout, stderr } = await execPromisified(compileProject);

	if (stderr) throw new Error(stderr);

	return Winston.log(CliColors.green(stdout));
}
