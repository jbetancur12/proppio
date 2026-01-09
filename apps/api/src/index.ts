import { startExpressServer } from './app';

startExpressServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
