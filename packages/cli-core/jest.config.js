// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require("@tsed/jest-config"),
  roots: ["<rootDir>/src", "<rootDir>/test"],
  moduleNameMapper: {
    "@tsed/cli-core": "<rootDir>/src/index.ts"
  },
  coverageThreshold: {
    global: {
      statements: 71.15,
      branches: 72.9,
      functions: 48.9,
      lines: 71.15
    }
  },
};
