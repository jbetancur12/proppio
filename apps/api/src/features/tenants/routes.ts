import { Router } from 'express';
import { TenantsController } from './controllers/tenants.controller';

const router = Router();
const controller = new TenantsController();

router.get('/subscription', (req, res, next) => controller.getSubscription(req, res, next));

export default router;
