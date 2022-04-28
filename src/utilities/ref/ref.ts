export interface Ref<T = any> {
	[key: string | symbol]: T | RefWatcher<T>[];
}

export function makeRef<T = any>(initialValue?: T): Ref<T> {
	const ref = Object.create(null);

	if (initialValue) ref.value = initialValue;

	const watchers: RefWatcher<T>[] = [];

	const handler: ProxyHandler<any> = {
		get: () => ref.value,
		set: (_, property, value: T | RefWatcher<T>[]) => {
			if (property === onupdate)
				if (Array.isArray(value)) return watchers.push(...value), true;

			return (ref.value = value), true;
		},
	};

	return new Proxy(Object.create(null), handler);
}

export async function assign<T = any>(x: Ref<T>, mutator: () => Promise<T>) {
	const newValue = await mutator();
	const oldValue = x.value;

	if (x[onupdate] && Array.isArray(x[onupdate]))
		for (const watcher of x[onupdate] as RefWatcher<T>[])
			await watcher(newValue, oldValue as T);

	x.value = newValue;
}

export async function watch<T = any>(ref: Ref<T>, onUpdate: RefWatcher<T>) {
	ref[onupdate] = [onUpdate];
}

type RefWatcher<T> = (to: T, from: T) => Promise<void>;
const onupdate = Symbol("onupdate");
