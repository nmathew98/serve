export default {
	cors: {
		origin: (
			origin: string,
			callback: (error: Error | null, origin: string | boolean) => void,
		) => {
			const allowedOrigins: string[] = ["http://localhost:3000"];
			if (allowedOrigins.includes(origin)) return callback(null, origin);

			return callback(null, false);
		},
		credentials: true,
	},
	helmet: {
		crossOriginResourcePolicy: {
			policy: "same-site",
		},
	},
};
