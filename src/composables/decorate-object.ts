/**
 * Decorates an object with responsibilities of another object
 *
 * They are applied as you would expect functional composition to apply
 *
 * The objects must conform to the same interface
 *
 * @param {Record<string, AnyFunction>} o n number of objects
 */
export default function decorateObject<
	T = unknown & Record<string, AnyFunction>,
>(...o: T[]): T {
	const composed = Object.create(null);

	if (!o.length) return composed;

	for (let i = o.length - 1; i >= 0; i--) {
		for (const key in o[i])
			if (
				o[i] &&
				typeof o[i] === "object" &&
				typeof (o[i] as unknown as Record<string, AnyFunction>)[key] ===
					"function"
			)
				if (!(key in composed))
					composed[key] = (o[i] as unknown as Record<string, AnyFunction>)[
						key
					] as AnyFunction;
				else {
					const x: Record<string, AnyFunction> = { ...composed };

					composed[key] = (...args: any[]) => {
						(x[key] as AnyFunction)(...args);

						(
							(o[i] as unknown as Record<string, AnyFunction>)[
								key
							] as AnyFunction
						)(...args);
					};
				}
	}

	return composed;
}

type AnyFunction = (...args: any[]) => any;
