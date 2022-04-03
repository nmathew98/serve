import {
	createLogger,
	transports,
	format,
	Logger as WinstonLogger,
} from "winston";

export interface Logger {
	/**
	 * Log a message
	 *
	 * Will be saved to combined.log
	 */
	log: (...args: string[]) => void;

	/**
	 * Log an error
	 *
	 * Will be saved to error.log
	 */
	error: (...args: string[]) => void;
}

const logger: WinstonLogger = createLogger({
	level: "info",
	format: format.combine(format.prettyPrint()),
	transports: [
		new transports.File({
			filename: "error.log",
			level: "error",
		}),
		new transports.File({ filename: "combined.log" }),
		new transports.Console({
			format: format.simple(),
		}),
	],
});

const Winston: Logger = {
	log: (...args: string[]) => {
		const message = args.join(" ");

		logger.info(message);
	},
	error: (...args: string[]) => {
		const message = args.join(" ");

		logger.error(message);
	},
};

export default Winston;
