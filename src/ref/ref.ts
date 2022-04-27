export interface Ref<T = any> {
	[key: string | symbol]: T;
}

export default function makeRef<T = any>(initialValue?: T): Ref<T> {
	const ref = Object.create(null);

	if (initialValue) ref.value = initialValue;

	const handler: ProxyHandler<any> = {
		get: () => ref.value,
		set: (x: T) => ((ref.value = x), true),
	};

	return new Proxy(Object.create(null), handler);
}
