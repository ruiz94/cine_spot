import pino from 'pino';
import { isProduction } from '@/config';

const logger = pino(
  isProduction
    ? {
        level: 'info',
        formatters: {
          level: (label) => {
            return { level: label.toUpperCase() };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      },
);

export default logger;
