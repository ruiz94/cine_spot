import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration with validation
 */
export const env = {
  // Server configuration
  PORT: process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000,
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  
  // Database configuration. 
  DATABASE_URL: process.env['DATABASE_URL'],
  
  // JWT configuration (for future use)
  JWT_SECRET: process.env['JWT_SECRET'] || 'your-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '7d',
  
  // API configuration
  API_KEY: process.env['API_KEY'],
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const requiredVars = ['DATABASE_URL'];
  
  const missingVars = requiredVars.filter(varName => !env[varName as keyof typeof env]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }
}

/**
 * Check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test';
