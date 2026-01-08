import { Router } from 'express';
import { TreasuryController } from './controllers/treasury.controller';

const router = Router();
const controller = new TreasuryController();

router.get('/balance', controller.getGlobalBalance);
router.get('/transactions', controller.getTransactions);
router.post('/transactions', controller.createTransaction);

export default router;
