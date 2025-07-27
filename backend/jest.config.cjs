/**
 * Jest Configuration for CineSpot Backend
 * Optimized for TypeScript + Node.js testing with ES Modules
 */

/** @type {import('jest').Config} */
const config = {
  // Test environment for Node.js backend
  testEnvironment: "node",

  // Enable TypeScript support with ESM
  preset: "ts-jest/presets/default-esm",
  
  // Treat TypeScript files as ESM
  extensionsToTreatAsEsm: ['.ts'],

  // Root directory for tests
  rootDir: "./",

  // Directories to search for tests
  roots: [
    "<rootDir>/src",
    "<rootDir>/tests"
  ],

  // Test file patterns
  testMatch: [
    "**/?(*.)+(spec|test).ts"
  ],

  // Transform TypeScript files with ESM support
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true,
      tsconfig: "./tsconfig.test.json"
    }],
  },

  // Module name mapping for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1"
  },

  // Coverage configuration
  collectCoverage: false,
  coverageDirectory: "coverage",
  
  // Clear mocks between tests
  clearMocks: true,

  // Files to ignore in tests
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],

  // Verbose output
  verbose: true,
};

module.exports = config;
