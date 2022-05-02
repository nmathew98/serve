import { opendir } from "fs/promises";
import { join } from "path/posix";

export default async function* ls(parent: string): AsyncGenerator<string> {
	for await (const child of await opendir(parent)) {
		const entry = join(parent, child.name);
		if (child.isDirectory()) yield* ls(entry);
		else if (child.isFile()) yield entry;
	}
}
