/**
 * Decorator to specify the modules a route uses
 *
 * Must be used before the `Route` decorator
 *
 * @param {string} modules the modules the route uses
 */
export function Modules<
	T extends { new (...args: any[]): Record<string, any> },
>(...modules: string[]) {
	return (constructor: T) => {
		return class extends constructor {
			modules = modules;
		} as any;
	};
}
