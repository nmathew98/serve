import { opendir } from "fs/promises";
import { join } from "path/posix";

export async function* ls(root: string): AsyncGenerator<string> {
	for await (const child of await opendir(root)) {
		const entry = join(root, child.name);
		if (child.isDirectory()) yield* ls(entry);
		else if (child.isFile()) yield entry;
	}
}
