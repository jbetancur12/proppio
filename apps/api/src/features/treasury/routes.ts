import { Router } from 'express';
import { TreasuryController } from './controllers/treasury.controller';

const router = Router();
const controller = new TreasuryController();

router.get('/balance', (req, res) => controller.getGlobalBalance(req, res));
router.get('/transactions', (req, res) => controller.getTransactions(req, res));
router.post('/transactions', (req, res) => controller.createTransaction(req, res));

export default router;
