export default function isConstructor(f: any) {
	if (typeof f !== "function") return false;

	try {
		new f();

		return true;
	} catch (error: any) {
		return false;
	}
}
