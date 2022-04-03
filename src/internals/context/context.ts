export interface ServeContext {
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
	 * Throws an error if the value is unavailable
	 *
	 * @param key the unique identifier for the value
	 */
	get(key: symbol | string): any;
}

function buildMakeContext() {
	const context: Map<symbol | string, any> = new Map();

	return function makeContext(): ServeContext {
		return Object.freeze({
			has(key: symbol | string) {
				return context.has(key);
			},
			set(key: symbol | string, value: any) {
				context.set(key, value);

				return this;
			},
			get: (key: symbol | string) => {
				// The error thrown here is intentional
				// The context will be used to pass entity objects around
				// So if an entity is unavailable we'd want to know as soon
				// as possible

				if (!context.has(key)) throw new Error("No such key available!");

				return context.get(key);
			},
		});
	};
}

const makeContext = buildMakeContext();

export default makeContext;
