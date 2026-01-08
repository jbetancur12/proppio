import { Router } from 'express';
import { LeasesController } from './controllers/leases.controller';
import multer from 'multer';

const router = Router();
const controller = new LeasesController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/expiring', (req, res, next) => controller.getExpiring(req, res, next));

// Rent increase routes (before :id to avoid conflicts)
router.get('/increases/preview', (req, res, next) => controller.previewIncreases(req, res, next));
router.post('/increases/apply', (req, res, next) => controller.applyIncrease(req, res, next));
router.post('/increases/bulk-apply', (req, res, next) => controller.bulkApplyIncreases(req, res, next));
router.get('/increases/ipc/:year', (req, res, next) => controller.getIPC(req, res, next));
router.post('/increases/ipc', (req, res, next) => controller.setIPC(req, res, next));

// Test endpoint for manual lease renewal (for testing)
router.post('/test-renewals', (req, res, next) => controller.testLeaseRenewals(req, res, next));

// Exit notice routes (specific paths before :id)
router.post('/exit-notices/:noticeId/confirm', (req, res, next) => controller.confirmExitNotice(req, res, next));
router.post('/exit-notices/:noticeId/cancel', (req, res, next) => controller.cancelExitNotice(req, res, next));

// Exit notice routes specific to lease
router.post('/:id/exit-notice', (req, res, next) => controller.createExitNotice(req, res, next));
router.get('/:id/exit-notices', (req, res, next) => controller.getExitNotices(req, res, next));

// Pending payments
router.get('/:id/pending-payments', (req, res, next) => controller.getPendingPayments(req, res, next));

router.post('/:id/terminate', (req, res, next) => controller.terminate(req, res, next));

const upload = multer({ storage: multer.memoryStorage() });
router.post('/:id/documents', upload.single('file'), (req, res, next) => controller.uploadContract(req, res, next));
router.get('/:id/contract', (req, res, next) => controller.getContractUrl(req, res, next));
router.post('/:id/activate', (req, res, next) => controller.activate(req, res, next));

// Generic ID routes (MUST BE LAST to avoid shadowing specific sub-routes)
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));

router.post('/:id/terminate', (req, res, next) => controller.terminate(req, res, next));

export default router;
