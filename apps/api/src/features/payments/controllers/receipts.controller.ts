import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { PaymentsService } from '../services/payments.service';
import { NotFoundError } from '../../../shared/errors/AppError';
import { generatePaymentReceipt } from '../utils/pdfGenerator';
import { logger } from '../../../shared/logger';

export class ReceiptsController {

    private getService(): PaymentsService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new PaymentsService(em);
    }

    /**
     * Public endpoint to download payment receipt as PDF
     * GET /api/receipts/:paymentId/download
     */
    async downloadReceipt(req: Request, res: Response, next: NextFunction) {
        try {
            const { paymentId } = req.params;
            const service = this.getService();

            // Fetch payment with all relations
            const payment = await service.findOne(paymentId);

            if (!payment.lease?.renter) {
                throw new NotFoundError('Payment data incomplete: Missing renter info');
            }

            // Generate PDF
            const pdfBuffer = await generatePaymentReceipt({
                payment,
                tenantName: `${payment.lease.renter.firstName} ${payment.lease.renter.lastName}`,
                companyName: 'Proppio'
            });

            const receiptId = payment.id.slice(0, 8).toUpperCase();
            const dateFormatted = new Date(payment.paymentDate).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const filename = `Recibo_${receiptId}_${dateFormatted.replace(/\s/g, '_')}.pdf`;

            // Set headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            logger.info({ paymentId, filename }, 'Receipt PDF downloaded');

            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }
}
