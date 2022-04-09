import { ServeContext } from "../context/context";

export interface ServeTest {
	getListener: () => any;
}

export default function buildMakeTest(context: ServeContext) {
	return function makeTest(configuration: ServeTestConfiguration): ServeTest {
		return Object.freeze({
			getListener: () => {
				switch (configuration.name) {
					case "web-server":
						return context.get("test:h3");
					default:
						return;
				}
			},
		});
	};
}

export interface ServeTestConfiguration {
	name: string;
}
