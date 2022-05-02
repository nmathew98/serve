import isSpec from "./is-spec";

export default function isTypeScript(path: string) {
	return /.*.ts/gm.test(path) && !isSpec(path);
}
