/**
 * Use one of two values depending on the condition
 *
 * @param {boolean} condition the condition
 * @returns a function which selects the correct value
 */
export const useIn =
	<T = any>(condition: boolean) =>
	(x: T, y: T) =>
		condition ? x : y;

/**
 * Use a value in production
 *
 * @param {T} x value to use in production
 * @param {T} y value to use in development
 * @returns the appropriate value
 */
export const useProduction = <T = any>(x: T, y: T) => {
	const useInProduction = useIn(process.env.NODE_ENV === "production");

	return useInProduction(x, y);
};
