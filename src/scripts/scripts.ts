#!/usr/bin/env node

import build from "./build";
import jest from "./jest";
import typecheck from "./typecheck";

const args = process.argv.slice(2);

const scriptName = args[0];
const scriptArgs = args.slice(1);

switch (scriptName) {
	case "build":
		build(scriptArgs);
		break;
	case "jest":
		jest(scriptArgs);
		break;
	case "typecheck":
		typecheck(scriptArgs);
		break;
	default:
		break;
}
