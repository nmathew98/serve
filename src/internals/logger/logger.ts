import {
	createLogger,
	transports,
	format,
	Logger as WinstonLogger,
} from "winston";

export interface Logger {
	log: (...args: string[]) => void;
	error: (...args: string[]) => void;
}

const logger: WinstonLogger = createLogger({
	level: "info",
	format: format.combine(
		format.label({ label: "Serve" }),
		format.timestamp(),
		format.prettyPrint(),
	),
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
		const message: string = args.join(" ");

		logger.info(message);
	},
	error: (...args: string[]) => {
		const message: string = args.join(" ");

		logger.error(message);
	},
};

export default Winston;
