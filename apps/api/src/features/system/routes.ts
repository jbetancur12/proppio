import { Router } from 'express';
import { SystemController } from './controllers/system.controller';
import { authMiddleware } from '../../shared/middlewares/authMiddleware';

const systemRoutes = Router();
const controller = new SystemController();

systemRoutes.use(authMiddleware);

systemRoutes.post('/cron/run', (req, res, next) => controller.runCronJob(req, res, next));

export default systemRoutes;
