import { resolve } from "path";
import findRootDirectory from "./find-root-directory";
import isPathValid from "./is-path-valid";

export default async function isPackageInstalled({
	name,
	internal = false,
}: {
	name: string;
	internal?: boolean;
}) {
	const projectDirectory = await findRootDirectory();
	const serveDirectory = resolve(__dirname, "../../");

	return await isPathValid(
		`${internal ? serveDirectory : projectDirectory}/node_modules/${name}`,
	);
}
