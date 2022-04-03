import { Example } from "$entities/example/example";

export default function buildPrintHelloWorld({
	Example,
}: {
	Example: Example;
}) {
	return function printHelloWorld(x: string) {
		Example.print(x);
		Example.hello(x);
		Example.world(x);
	};
}
