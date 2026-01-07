import PDFDocument from 'pdfkit';
import { Payment } from '../entities/Payment';

interface ReceiptData {
    payment: Payment;
    tenantName: string;
    companyName?: string;
}

/**
 * Generate a PDF receipt for a payment
 * Returns a buffer containing the PDF
 */
export function generatePaymentReceipt(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const { payment, tenantName, companyName } = data;

        // Helper functions
        const formatCurrency = (amount: number) =>
            new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
        const formatDate = (date: Date) =>
            new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
        const formatMonth = (date: Date) =>
            new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('RECIBO DE PAGO', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').fillColor('#666').text(companyName || 'Rent Manager', { align: 'center' });
        doc.moveDown(2);

        // Receipt Info Box
        doc.fillColor('#000').fontSize(10);
        doc.rect(50, doc.y, 495, 80).stroke();
        const boxY = doc.y + 15;

        doc.text(`Recibo No: ${payment.id.slice(0, 8).toUpperCase()}`, 60, boxY);
        doc.text(`Fecha de Emisión: ${formatDate(new Date())}`, 300, boxY);
        doc.text(`Fecha de Pago: ${formatDate(payment.paymentDate)}`, 60, boxY + 20);
        doc.text(`Método: ${getMethodLabel(payment.method)}`, 300, boxY + 20);
        if (payment.reference) {
            doc.text(`Referencia: ${payment.reference}`, 60, boxY + 40);
        }

        doc.y = boxY + 70;
        doc.moveDown(2);

        // Tenant Info
        doc.fontSize(12).font('Helvetica-Bold').text('RECIBIDO DE:');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(tenantName);
        doc.moveDown(1.5);

        // Property & Unit Info
        doc.fontSize(12).font('Helvetica-Bold').text('POR CONCEPTO DE:');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Arrendamiento: ${(payment.lease as any)?.unit?.name || 'Unidad'}`);
        doc.text(`Período: ${formatMonth(payment.periodStart)} - ${formatMonth(payment.periodEnd)}`);
        doc.moveDown(2);

        // Amount Box
        doc.rect(50, doc.y, 495, 60).fillAndStroke('#f0f9ff', '#0284c7');
        const amountY = doc.y + 15;
        doc.fillColor('#0284c7').fontSize(14).font('Helvetica-Bold');
        doc.text('VALOR PAGADO:', 60, amountY);
        doc.fontSize(24).text(formatCurrency(payment.amount), 60, amountY + 20);

        doc.y = amountY + 55;
        doc.moveDown(3);

        // Footer
        doc.fillColor('#666').fontSize(9).font('Helvetica');
        doc.text('Este recibo es válido como comprobante de pago.', 50, 700, { align: 'center' });
        doc.text(`Generado el ${formatDate(new Date())} por Rent Manager`, { align: 'center' });

        doc.end();
    });
}

function getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
        CASH: 'Efectivo',
        TRANSFER: 'Transferencia Bancaria',
        CHECK: 'Cheque',
        CARD: 'Tarjeta',
        OTHER: 'Otro'
    };
    return labels[method] || method;
}
