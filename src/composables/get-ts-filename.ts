export default function getTypeScriptFilename(path: string) {
	return path.match(/[\w\d-]*.ts/gim)?.pop();
}
