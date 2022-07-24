#!/usr/bin/env node

import type { ServeConfig } from "../serve/serve";
import { build, watch } from "../build/build";
import { config } from "../utilities/config";

const args = process.argv.slice(2);

const scriptName = args[0];

const c = (await config()) as ServeConfig;

switch (scriptName) {
	case "build": {
		await build(c);
		break;
	}
	case "watch": {
		await watch(c);
		break;
	}
	default:
		break;
}
