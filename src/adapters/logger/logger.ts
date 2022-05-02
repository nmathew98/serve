import consola from "consola";

export interface Logger {
	/**
	 * Print a success message
	 */
	success: (...args: string[]) => void;

	/**
	 * Log a message
	 */
	log: (...args: string[]) => void;

	/**
	 * Log an error
	 */
	error: (...args: string[]) => void;
}

const Consola: Logger = {
	success: (...args: string[]) => consola.success(args.join(" ")),
	log: (...args: string[]) => consola.info(args.join(" ")),
	error: (...args: string[]) => consola.error(args.join(" ")),
};

export default Consola;
