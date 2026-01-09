import { Resend } from 'resend';
import { Payment } from '../../features/payments/entities/Payment';
import { logger } from '../logger';
import { generatePaymentReceipt } from '../../features/payments/utils/pdfGenerator';

export class EmailService {
    private resend: Resend;
    private readonly FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Proppio <no-reply@smaf.com.co>';

    constructor() {
        // Fallback to empty string if not set, handled by Resend error if call is made
        this.resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');
    }

    async sendPaymentReceipt(payment: Payment) {
        if (!payment.lease?.renter?.email) {
            logger.warn({ paymentId: payment.id }, 'Renter email not found for payment');
            return;
        }

        const amountFormatted = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(payment.amount);

        const dateFormatted = new Date(payment.paymentDate).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Recibo de Pago</h1>
                </div>
                <div style="padding: 24px;">
                    <p style="color: #374151; font-size: 16px;">Hola <strong>${payment.lease.renter.firstName}</strong>,</p>
                    <p style="color: #374151; font-size: 16px;">Hemos recibido tu pago exitosamente. Aquí están los detalles:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
                        <p style="margin: 8px 0; color: #4b5563;"><strong>Fecha:</strong> ${dateFormatted}</p>
                        <p style="margin: 8px 0; color: #4b5563;"><strong>Concepto:</strong> Canon de Arrendamiento</p>
                        <p style="margin: 8px 0; color: #4b5563;"><strong>Propiedad:</strong> ${payment.lease.unit.name}</p>
                        <h2 style="margin: 16px 0 0 0; color: #111827;">${amountFormatted}</h2>
                    </div>

                    <p style="color: #16a34a; font-size: 14px; font-weight: 600;">📎 Adjuntamos tu recibo en PDF para tu comodidad.</p>
                    <p style="color: #6b7280; font-size: 14px;">Este es un comprobante automático. Si tienes dudas, contacta a la administración.</p>
                </div>
                <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Proppio</p>
                </div>
            </div>
        `;

        try {
            // Generate PDF
            const pdfBuffer = await generatePaymentReceipt({
                payment,
                tenantName: `${payment.lease.renter.firstName} ${payment.lease.renter.lastName}`,
                companyName: 'Proppio'
            });

            const receiptId = payment.id.slice(0, 8).toUpperCase();
            const filename = `Recibo_${receiptId}_${dateFormatted.replace(/\s/g, '_')}.pdf`;

            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [payment.lease.renter.email],
                subject: `Recibo de Pago - ${dateFormatted}`,
                html: htmlContent,
                attachments: [
                    {
                        filename,
                        content: pdfBuffer
                    }
                ]
            });

            if (error) {
                logger.error({ err: error, paymentId: payment.id, recipientEmail: payment.lease.renter.email }, 'Resend API error');
                return;
            }

            logger.info({ paymentId: payment.id, recipientEmail: payment.lease.renter.email, emailId: data?.id }, 'Payment receipt email sent successfully with PDF attachment');
        } catch (err) {
            logger.error({ err, paymentId: payment.id }, 'Unexpected error sending email');
            throw err;
        }
    }
}
