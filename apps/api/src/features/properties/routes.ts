import { Router } from 'express';
import { PropertiesController } from './controllers/properties.controller';

const router = Router();
const controller = new PropertiesController();

// We bind the methods to the controller instance to preserve 'this'
router.get('/', controller.list.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/:id/stats', controller.getStats.bind(controller));
router.get('/:id', controller.get.bind(controller));

// router.put('/:id', controller.update.bind(controller)); 
// router.delete('/:id', controller.delete.bind(controller));

// Units
import { UnitsController } from './controllers/units.controller';
const unitsController = new UnitsController();

router.post('/:propertyId/units', unitsController.create.bind(unitsController)); // POST /api/properties/:id/units? No, let's keep it clean
// Better design: POST /api/units (with propertyId in body) or POST /api/properties/:propertyId/units
// Let's use nested route for creation if it's strictly coupled, or separate.
// The controller expects propertyId in body for create. Let's make it consistent.
// If body has propertyId, we can use /api/units.
// But listing is often by property.
// Let's add: POST /properties/units (create) and GET /properties/:id/units

router.get('/:propertyId/units', unitsController.listByProperty.bind(unitsController));
// We need to support creating a unit. The specific controller method reads body.
// Ideally: POST /api/properties/units
router.post('/units', unitsController.create.bind(unitsController));
router.put('/units/:id', unitsController.update.bind(unitsController));
router.delete('/units/:id', unitsController.delete.bind(unitsController));

export default router;
