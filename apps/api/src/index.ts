import { startExpressServer } from './app';
import { logger } from './shared/logger';

startExpressServer().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
