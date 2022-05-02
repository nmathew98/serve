import { stat } from "fs/promises";

export default async function isPathValid(path: string) {
	try {
		await stat(path);
		return true;
	} catch (error: any) {
		return false;
	}
}
