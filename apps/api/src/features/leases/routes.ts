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
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

router.post('/:id/documents', upload.single('file'), (req, res, next) => controller.uploadContract(req, res, next));

// Rent increase routes
router.get('/increases/preview', (req, res, next) => controller.previewIncreases(req, res, next));
router.post('/increases/apply', (req, res, next) => controller.applyIncrease(req, res, next));
router.post('/increases/bulk-apply', (req, res, next) => controller.bulkApplyIncreases(req, res, next));
router.get('/increases/ipc/:year', (req, res, next) => controller.getIPC(req, res, next));
router.post('/increases/ipc', (req, res, next) => controller.setIPC(req, res, next));

router.post('/:id/terminate', (req, res, next) => controller.terminate(req, res, next));

export default router;
