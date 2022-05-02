/**
 * Decorator to specify if a route is protected
 *
 * Must be used before the `Route` decorator
 */
export function Protected<
	T extends { new (...args: any[]): Record<string, any> },
>() {
	return (constructor: T) => {
		return class extends constructor {
			protected = true;
		} as any;
	};
}
