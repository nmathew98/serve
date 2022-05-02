export default function isTypeScript(path: string) {
	return /.*.ts/gm.test(path);
}
