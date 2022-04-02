module.exports = {
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "prettier"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	rules: {
		"prettier/prettier": ["error", { usePrettierrc: true }],
		"no-param-reassign": "off",
		camelcase: [1, { properties: "never" }],
		"no-console": 2,
		"@typescript-eslint/no-explicit-any": 0,
	},
};
