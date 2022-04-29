const outputDirectory = process.env.OUTPUT_DIRECTORY ?? "dist";

module.exports = {
	transform: {
		"^.+\\.(t|j)sx?$": [
			"@swc/jest",
			{
				sourceMaps: true,
			},
		],
	},
	testEnvironment: "node",
	testPathIgnorePatterns: [
		"<rootDir>/node_modules/",
		`<rootDir>/${outputDirectory}/`,
	],
};
