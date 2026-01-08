import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { TreasuryService } from '../services/treasury.service';

export class TreasuryController {
    async getGlobalBalance(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) throw new Error('EntityManager not found');

            const service = new TreasuryService(em);
            const balance = await service.getGlobalBalance();

            res.json({
                success: true,
                data: balance
            });
        } catch (error) {
            console.error('Error fetching global balance:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async getTransactions(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) throw new Error('EntityManager not found');

            const service = new TreasuryService(em);
            const transactions = await service.getUnifiedTransactions();

            res.json({
                success: true,
                data: transactions
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async createTransaction(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) throw new Error('EntityManager not found');

            const service = new TreasuryService(em);
            const tx = await service.createTransaction({
                ...req.body,
                date: new Date(req.body.date)
            });

            res.status(201).json({
                success: true,
                data: tx
            });
        } catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
