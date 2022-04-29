export interface App {
	/**
	 * Use a middleware with the app
	 */
	use: (...args: any[]) => void;
}

export interface Router {
	/**
	 * Add a route
	 */
	use: (...args: any[]) => void;
}
