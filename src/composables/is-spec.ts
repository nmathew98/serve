export default function isSpec(path: string) {
	return /.*\.spec/.test(path);
}
