import { Router } from 'express';
import { LeasesController } from './controllers/leases.controller';

const router = Router();
const controller = new LeasesController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/expiring', (req, res, next) => controller.getExpiring(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.post('/:id/activate', (req, res, next) => controller.activate(req, res, next));
router.post('/:id/terminate', (req, res, next) => controller.terminate(req, res, next));

export default router;
