import { Router } from 'express';
import { PaymentsController } from './controllers/payments.controller';

const router = Router();
const controller = new PaymentsController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/summary/:leaseId', (req, res, next) => controller.getSummary(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));

export default router;
