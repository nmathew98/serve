import { mkdir, stat } from "fs/promises";

export default async function createFolder(path: string) {
	try {
		await stat(path);
	} catch (error: any) {
		await mkdir(path, { recursive: true });
	}
}
