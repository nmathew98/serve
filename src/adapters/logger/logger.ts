import consola from "consola";
import decorateObject from "../../composables/decorate-object";
import isPackageInstalled from "../../composables/is-package-installed";

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
	error: (...args: (string | Error)[]) => Promise<void>;
}

const Sentry: Logger = {
	success: () => {
		return;
	},
	log: () => {
		return;
	},
	error: async (...args: (string | Error)[]) => {
		try {
			const sentry = "@sentry/node";
			let Sentry: any;

			const isSentryInstalled = await isPackageInstalled({ name: sentry });
			if (isSentryInstalled) Sentry = await import(sentry);

			let transaction: any;
			if (Sentry) {
				const currentDate = new Date();
				const name = currentDate.toDateString();

				transaction = Sentry.startTransaction({
					op: "transaction",
					name,
				});
			}

			for (const arg of args)
				if (typeof arg === "string") Sentry?.captureMessage(arg);
				else if (arg instanceof Error) Sentry?.captureException(arg);

			transaction?.finish();
		} catch (error: any) {
			consola.error(error);
		}
	},
};

const Consola: Logger = {
	success: (...args: string[]) => consola.success(args.join(" ")),
	log: (...args: string[]) => consola.info(args.join(" ")),
	error: async (...args: (string | Error)[]) => {
		for (const arg of args)
			if (typeof arg === "string") consola.error(arg);
			else if (arg instanceof Error) consola.error(arg.message);
	},
};

export const Logger: Logger = decorateObject<Logger>(Sentry, Consola);

export const SymbolLogger = Symbol("Logger");
