import build from "./build";
import jest from "./jest";

export default async function runScript(argv: string[]) {
	const args = argv.slice(2);

	switch (args[0]) {
		case "build":
			await build();
			break;
		case "jest":
			await jest(args.slice(1));
			break;
		default:
			break;
	}
}
