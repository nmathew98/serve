import { resolve } from "path";
import isPathValid from "./is-path-valid";

export default async function isPackageInstalled(name: string) {
	const rootDirectory = resolve(__dirname, "../../");

	return await isPathValid(`${rootDirectory}/node_modules/${name}`);
}
