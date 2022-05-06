import consola from "consola";
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

const Consola: Logger = {
	success: (...args: string[]) => consola.success(args.join(" ")),
	log: (...args: string[]) => consola.info(args.join(" ")),
	error: async (...args: (string | Error)[]) => {
		try {
			const sentry = "@sentry/node";
			let Sentry: any;

			const isSentryInstalled = await isPackageInstalled({ name: sentry });
			if (isSentryInstalled) Sentry = await import(sentry);

			let transaction: any;
			if (Sentry) {
				const currentDate = new Date();
				const name = currentDate.toTimeString();

				transaction = Sentry.startTransaction({
					op: "transaction",
					name,
				});
			}

			for (const arg of args)
				if (typeof arg === "string") {
					Sentry?.captureMessage(arg);
					consola.error(arg);
				} else if (arg instanceof Error) {
					Sentry?.captureException(arg);
					consola.error(arg.message);
				}

			transaction?.finish();
		} catch (error: any) {
			consola.error(error);
		}
	},
};

export default Consola;
