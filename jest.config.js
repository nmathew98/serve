const outputDirectory = process.env.OUTPUT_DIRECTORY ?? "dist";

module.exports = {
	transform: {
		"^.+\\.(t|j)sx?$": ["@swc/jest"],
	},
	testEnvironment: "node",
	testPathIgnorePatterns: [
		"<rootDir>/node_modules/",
		`<rootDir>/${outputDirectory}/`,
		`<rootDir>/../../../${outputDirectory}`,
	],
};
