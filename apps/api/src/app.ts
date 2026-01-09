import express from 'express';
import cors from 'cors';
import { RequestContext } from '@mikro-orm/core';
import http from 'http';
import { initDI, DI } from './di';
import { authMiddleware } from './shared/middlewares/authMiddleware';
import { errorMiddleware } from './shared/middlewares/errorMiddleware';
import { CronScheduler } from './shared/services/cron-scheduler';
import { logger } from './shared/logger';

// Routes
import authRoutes from './features/auth/routes';
import propertyRoutes from './features/properties/routes';
import renterRoutes from './features/renters/routes';
import leaseRoutes from './features/leases/routes';
import paymentRoutes from './features/payments/routes';
import statsRoutes from './features/stats/routes';
import expenseRoutes from './features/expenses/routes';
import maintenanceRoutes from './features/maintenance/routes';
import adminRoutes from './features/admin/routes';
import treasuryRoutes from './features/treasury/routes';

export const startExpressServer = async () => {
    // 1. Initialize DI (ORM & Repositories)
    await initDI();

    const app = express();
    const port = process.env.PORT || 3000;

    // 2. Global Middlewares
    app.use(cors());
    app.use(express.json());

    // Request logging
    const { requestLogger } = await import('./shared/middleware/requestLogger');
    app.use(requestLogger);

    // 3. MikroORM Context Middleware
    app.use((req, res, next) => {
        RequestContext.create(DI.orm.em, next);
        // Fallback: Attach EM to req for middlewares that break AsyncLocalStorage (e.g. Multer)
        (req as any).em = DI.orm.em;
    });

    // 4. Public Routes
    app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
    app.use('/auth', authRoutes);

    // 5. Protected Routes
    const apiRouter = express.Router();
    apiRouter.use(authMiddleware);

    apiRouter.use('/properties', propertyRoutes);
    apiRouter.use('/renters', renterRoutes);
    apiRouter.use('/leases', leaseRoutes);
    apiRouter.use('/payments', paymentRoutes);
    apiRouter.use('/stats', statsRoutes);
    apiRouter.use('/expenses', expenseRoutes);
    apiRouter.use('/maintenance', maintenanceRoutes);
    apiRouter.use('/admin', adminRoutes);
    apiRouter.use('/treasury', treasuryRoutes);

    apiRouter.get('/me', (req, res) => {
        res.json({ message: 'You are authenticated', user: (req as any).user });
    });

    app.use('/api', apiRouter);

    // 6. Error Handler
    app.use(errorMiddleware);

    // 7. Start Cron Jobs
    await CronScheduler.start(DI.orm);

    // 8. Start Server
    const httpServer = http.createServer(app);

    // Store server instance in DI
    DI.server = httpServer.listen(port, () => {
        logger.info({ port }, 'Server running');
    });

    // 9. Graceful Shutdown
    const gracefulShutdown = async (signal: string) => {
        logger.info({ signal }, 'Starting graceful shutdown');
        try {
            if (DI.server) {
                DI.server.close();
                logger.info('HTTP server closed');
            }
            await DI.orm.close();
            logger.info('Database connection closed');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, 'Error during shutdown');
            process.exit(1);
        }
    };

    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
};
