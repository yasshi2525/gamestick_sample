/** @type {import("@jest/types").Config} */
const config = {
	collectCoverage: true,
	coverageDirectory: "coverage",
	coverageReporters: ["json", "lcov", "text"],
	testMatch: ["<rootDir>/spec/**/*Spec.ts"],
	transform: {
		"^.+.ts$": [
			"ts-jest", { tsconfig: "<rootDir>/spec/tsconfig.json" }
		]
	},
	globalSetup: "<rootDir>/spec/runner/setup.js",
	globalTeardown: "<rootDir>/spec/runner/teardown.js"
};
export default config;
