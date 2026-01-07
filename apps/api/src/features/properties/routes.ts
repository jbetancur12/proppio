import { Router } from 'express';
import { PropertiesController } from './controllers/properties.controller';

const router = Router();
const controller = new PropertiesController();

// We bind the methods to the controller instance to preserve 'this'
router.get('/', controller.list.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/:id', controller.get.bind(controller));

// router.put('/:id', controller.update.bind(controller)); 
// router.delete('/:id', controller.delete.bind(controller));

export default router;
