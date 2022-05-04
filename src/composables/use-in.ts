/**
 * Use one of two values depending on the condition
 *
 * @param {boolean} condition the condition
 * @returns a function which selects the correct value
 */
export default function useIn<T = any>(condition: boolean) {
	return (x: T, y: T) => (condition ? x : y);
}
