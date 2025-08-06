import { PrismaClient } from '@prisma/client';
import { isDevelopment, validateEnv } from './env';

// Validate environment variables before creating Prisma client
validateEnv();

/**
 * Global Prisma Client instance
 * Singleton pattern to avoid multiple connections in development
 */
declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (isDevelopment) {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
