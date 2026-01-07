import express from 'express';
import cors from 'cors';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from './mikro-orm.config';
import { authMiddleware } from './shared/middlewares/authMiddleware';

export const createApp = async () => {
    const app = express();

    // 1. Initialize ORM
    const orm = await MikroORM.init(config);

    // 2. Global Middlewares
    app.use(cors());
    app.use(express.json());

    // 3. MikroORM Context Middleware (forks EM per request)
    // Important: This must be before routes/auth
    app.use((req, res, next) => RequestContext.create(orm.em, next));

    // 4. Public Routes (e.g. Health Check, Login)
    app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

    // 5. Protected Routes Middleware
    // For now, we apply it to everything under /api
    const apiRouter = express.Router();
    apiRouter.use(authMiddleware);

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
