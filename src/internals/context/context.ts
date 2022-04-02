interface ServeContext {
	/**
	 * Checks if a key is available in context
	 *
	 * @param key the key whose existence to check for
	 */
	has(key: symbol | string): boolean;

	/**
	 * Provide a value to be used globally
	 *
	 * @param key a unique identifier for the value, overrides any existing keys
	 * @param value a value which is referred to by the key
	 */
	set(key: symbol | string, value: any): ServeContext;

	/**
	 * Use a value from the context
	 *
	 * @param key the unique identifier for the value
	 */
	get(key: symbol | string): any;
}

function buildMakeContext() {
	const context: Record<symbol | string, any> = Object.create(null);

	return function makeContext(): ServeContext {
		return Object.freeze({
			has(key: symbol | string) {
				return key in context;
			},
			set(key: symbol | string, value: any) {
				context[key] = value;

				return this;
			},
			get: (key: symbol | string) => {
				if (!(key in context)) throw new Error("No such key available!");

				return context[key];
			},
		});
	};
}

const makeContext = buildMakeContext();

export { makeContext, ServeContext };
