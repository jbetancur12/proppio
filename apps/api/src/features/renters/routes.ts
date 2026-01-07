import { Router } from 'express';
import { RentersController } from './controllers/renters.controller';

const router = Router();
const controller = new RentersController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));

export default router;
