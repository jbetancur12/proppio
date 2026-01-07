import { Router } from 'express';
import { StatsController } from './controllers/stats.controller';

const router = Router();
const controller = new StatsController();

router.get('/dashboard', (req, res, next) => controller.getDashboard(req, res, next));

export default router;
