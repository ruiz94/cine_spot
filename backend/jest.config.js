/**
 * Jest Configuration for CineSpot Backend
 * Optimized for TypeScript + Node.js testing
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

  // File extensions Jest will process
  moduleFileExtensions: [
    "ts",
    "tsx", 
    "js",
    "jsx",
    "json"
  ],

  // Test file patterns
  testMatch: [
    "**/__tests__/**/*.?([mc])[jt]s?(x)",
    "**/?(*.)+(spec|test).?([mc])[jt]s?(x)"
  ],

  // Transform TypeScript files with ESM support
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true,
      tsconfig: "./tsconfig.test.json"
    }],
  },

  // Module name mapping for path aliases (matching your tsconfig.json)
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
  coverageProvider: "v8",
  
  // Files to collect coverage from
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
    "!src/index.ts", // Usually exclude main entry point
  ],

  // Coverage thresholds (disabled until source code is added)
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70
  //   }
  // },

  // Clear mocks between tests
  clearMocks: true,

  // Automatically restore mocks
  restoreMocks: true,

  // Files to ignore in tests
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],

  // Setup files (run before each test file)
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Verbose output
  verbose: true,
};

module.exports = config;
