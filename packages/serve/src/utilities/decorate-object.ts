/**
 * Decorates an object with responsibilities of another object
 *
 * They are applied as you would expect functional composition to apply
 *
 * The objects must conform to the same interface
 *
 * @param {Record<string, AnyFunction>} s n number of objects
 */
export const decorateObject = <T = unknown & Record<string, AnyFunction>>(
	...s: T[]
): T => {
	const handler: ProxyHandler<any> = {
		get:
			(_, k) =>
			(...args: any[]) =>
				s
					.filter(n => typeof n === "object")
					.filter(n => typeof (n as any)[k] === "function")
					.map(n => (n as any)[k])
					.reduce((acc, r) => r(acc ?? args), args),
		set: () => true,
	};

	const proxy = new Proxy(Object.create(null), handler);

	return proxy;
};

type AnyFunction = (...args: any[]) => any;
