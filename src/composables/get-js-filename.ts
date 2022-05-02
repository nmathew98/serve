export default function getJavaScriptFilename(path: string) {
	return path.match(/[\w\d-]*.js/gim)?.pop();
}
