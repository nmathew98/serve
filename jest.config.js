module.exports = {
	transform: {
		"^.+\\.(t|j)sx?$": ["@swc/jest"],
	},
	testEnvironment: "node",
	testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
};
