#!/usr/bin/env node

import build from "./build";
import jest from "./jest";

const args = process.argv.slice(2);

switch (args[0]) {
	case "build":
		build(args.slice(1));
		break;
	case "jest":
		jest(args.slice(1));
		break;
	default:
		break;
}
