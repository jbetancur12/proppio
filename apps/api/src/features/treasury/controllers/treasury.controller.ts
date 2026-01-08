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

            const { startDate, endDate, page, limit } = req.query;

            const service = new TreasuryService(em);
            const result = await service.getUnifiedTransactions({
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 50
            });

            res.json({
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    page: page ? Number(page) : 1,
                    limit: limit ? Number(limit) : 50
                }
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
