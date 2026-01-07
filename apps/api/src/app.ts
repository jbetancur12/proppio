import express from 'express';
import cors from 'cors';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from './mikro-orm.config';
import { authMiddleware } from './shared/middlewares/authMiddleware';
import propertyRoutes from './features/properties/routes';
import authRoutes from './features/auth/routes';
import { errorMiddleware } from './shared/middlewares/errorMiddleware';

import renterRoutes from './features/renters/routes';
import leaseRoutes from './features/leases/routes';

export const createApp = async () => {
    // 1. Initialize ORM
    const orm = await MikroORM.init(config);

    const app = express();

    // 2. Global Middlewares
    app.use(cors());
    app.use(express.json());

    // 3. MikroORM Context Middleware (forks EM per request)
    // Important: This must be before routes/auth
    app.use((req, res, next) => RequestContext.create(orm.em, next));

    // 4. Public Routes (e.g. Health Check, Login)
    app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
    app.use('/auth', authRoutes);

    // 5. Protected Routes Middleware
    // For now, we apply it to everything under /api
    const apiRouter = express.Router();
    apiRouter.use(authMiddleware);

    // Feature Routes
    apiRouter.use('/properties', propertyRoutes);
    apiRouter.use('/renters', renterRoutes);
    apiRouter.use('/leases', leaseRoutes);

    // Example protected route to verify context
    apiRouter.get('/me', (req, res) => {
        // We can safely import getContext() here
        const { getContext } = require('./shared/utils/RequestContext');
        const ctx = getContext();
        res.json({ message: 'You are authenticated', user: ctx });
    });

    app.use('/api', apiRouter);

    return { app, orm };
};
