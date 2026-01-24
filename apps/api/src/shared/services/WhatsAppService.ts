import type { Payment } from '../../features/payments/entities/Payment';
import { logger } from '../logger';

export class WhatsAppService {
    private readonly phoneNumberId: string;
    private readonly accessToken: string;
    private readonly apiVersion: string;
    private readonly publicApiUrl: string;
    private readonly isTestMode: boolean;
    private readonly testNumber: string; // e.g., +573138124282

    constructor() {
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
        this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
        this.publicApiUrl = process.env.PUBLIC_API_URL || 'https://api.tusass.com';
        this.isTestMode = process.env.WHATSAPP_IS_TEST === 'true';
        this.testNumber = process.env.WHATSAPP_TEST_NUMBER || '+573138124282';
    }

    async sendPaymentReceipt(payment: Payment) {
        if (!payment.lease?.renter?.phone) {
            logger.warn({ paymentId: payment.id }, 'Renter phone not found for payment WhatsApp notification');
            return;
        }

        if (!this.phoneNumberId || !this.accessToken) {
            logger.warn('WhatsApp credentials not configured, skipping notification');
            return;
        }

        const amountFormatted = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(payment.amount);

        const dateFormatted = new Date(payment.paymentDate).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const receiptUrl = `${this.publicApiUrl}/api/receipts/${payment.id}/download`;

        // Clean phone number (remove spaces, dashes, and ensure it has country code)
        let phoneNumber = payment.lease.renter.phone.replace(/[\s-]/g, '');
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = `+57${phoneNumber}`; // Default to Colombia
        }

        // Use test number if in test mode (for WhatsApp test accounts)
        const recipientNumber = this.isTestMode ? this.testNumber : phoneNumber;

        if (this.isTestMode) {
            logger.info(
                { original: phoneNumber, testNumber: this.testNumber },
                'WhatsApp test mode: routing to test number',
            );
        }

        const formatDate = (d: Date) =>
            new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
        const periodRange = `${formatDate(payment.periodStart)} - ${formatDate(payment.periodEnd)}`;

        const message = `✅ *Pago Recibido*

Hola *${payment.lease.renter.firstName}*,

Recibimos tu pago de *${amountFormatted}*
📅 Fecha: ${dateFormatted}
🗓️ Periodo: ${periodRange}
🏠 Concepto: Canon de Arrendamiento
📍 Propiedad: ${payment.lease.unit?.name || 'Unidad'}

📄 Descarga tu recibo aquí:
${receiptUrl}

¡Gracias por tu pago!
_- Proppio_`;

        try {
            const response = await fetch(
                `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: recipientNumber,
                        type: 'text',
                        text: {
                            body: message,
                        },
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                logger.error(
                    {
                        err: errorData,
                        paymentId: payment.id,
                        recipientPhone: recipientNumber,
                    },
                    'WhatsApp API error',
                );
                return;
            }

            const data = await response.json();
            logger.info(
                {
                    paymentId: payment.id,
                    recipientPhone: recipientNumber,
                    messageId: data.messages?.[0]?.id,
                },
                'WhatsApp notification sent successfully',
            );
        } catch (err) {
            logger.error({ err, paymentId: payment.id }, 'Unexpected error sending WhatsApp notification');
        }
    }
}
