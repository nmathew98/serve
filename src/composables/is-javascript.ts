export default function isJavaScript(path: string) {
	return /.*.js/gm.test(path);
}
