import { startExpressServer } from './app';
import { logger } from './shared/logger';

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Promise Rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

startExpressServer().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
