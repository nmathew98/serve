export interface App {
	/**
	 * Use a middleware with the app
	 */
	use: (...args: any[]) => void;
}
