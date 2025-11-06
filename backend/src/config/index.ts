/**
 * Main configuration file
 * Exports all configuration modules
 */

export { env, validateEnv, isDevelopment, isProduction, isTest } from './env';
export { prisma } from './database';

// Environment validation is done in env.ts when needed
