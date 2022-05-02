import isSpec from "./is-spec";

export default function isJavaScript(path: string) {
	return /.*.js/gm.test(path) && !isSpec(path);
}
