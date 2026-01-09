import PDFDocument from 'pdfkit';
import { Payment } from '../entities/Payment';
import { Lease } from '../../leases/entities/Lease';
import { UnitEntity } from '../../properties/entities/Unit';

interface ReceiptData {
    payment: Payment & { lease: Lease & { unit?: UnitEntity } };
    tenantName: string;
    companyName?: string;
}

// Proppio Brand Colors
const COLORS = {
    primary: '#4F46E5',   // Indigo-600
    dark: '#312E81',      // Indigo-900
    light: '#EEF2FF',     // Indigo-50 (Backgrounds)
    success: '#16A34A',   // Green-600
    text: '#374151',      // Gray-700
    textLight: '#6B7280', // Gray-500
    white: '#FFFFFF'
};

/**
 * Generate a Modern PDF receipt for a payment
 */
export function generatePaymentReceipt(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
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

        // --- BACKGROUND DECORATION ---
        // Top colored bar
        doc.rect(0, 0, 600, 15).fill(COLORS.primary);

        // --- HEADER ---
        const startY = 50;

        // Logo / Brand Name (Left)
        doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.primary).text('Proppio', 40, startY);
        doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight).text('Gestión Inteligente', 40, startY + 30);

        // Receipt Details (Right)
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textLight).text('RECIBO DE PAGO', 400, startY, { align: 'right', width: 150 });
        doc.fontSize(14).font('Helvetica').fillColor(COLORS.dark).text(`#${payment.id.slice(0, 8).toUpperCase()}`, 400, startY + 15, { align: 'right', width: 150 });
        doc.fontSize(9).font('Helvetica').fillColor(COLORS.textLight).text(formatDate(new Date()), 400, startY + 35, { align: 'right', width: 150 });

        // Divider
        doc.moveTo(40, startY + 60).lineTo(555, startY + 60).strokeColor('#E5E7EB').stroke();

        // --- SUCCESS BANNER (AMOUNT) ---
        const bannerY = startY + 80;
        doc.roundedRect(40, bannerY, 515, 80, 5).fill(COLORS.light);

        // Icon Circle (Abstract)
        doc.circle(80, bannerY + 40, 20).fill(COLORS.success);
        doc.lineWidth(3).strokeColor(COLORS.white).moveTo(72, bannerY + 40).lineTo(78, bannerY + 46).lineTo(88, bannerY + 34).stroke();

        // Text
        doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.success).text('PAGO EXITOSO', 115, bannerY + 25);
        doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.dark).text(formatCurrency(payment.amount), 115, bannerY + 42);

        // --- DETAILS GRID ---
        const gridY = bannerY + 110;
        const col1Ex = 40;
        const col2Ex = 300;
        let currentY = gridY;

        const drawLabelValue = (label: string, value: string, x: number, y: number) => {
            doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.textLight).text(label.toUpperCase(), x, y);
            doc.fontSize(11).font('Helvetica').fillColor(COLORS.text).text(value, x, y + 15, { width: 220 });
        };

        // Row 1
        drawLabelValue('Arrendatario', tenantName, col1Ex, currentY);
        drawLabelValue('Propiedad / Unidad', payment.lease.unit?.name || 'Unidad General', col2Ex, currentY);
        currentY += 50;

        // Row 2
        drawLabelValue('Concepto', 'Canon de Arrendamiento', col1Ex, currentY);
        drawLabelValue('Período Facturado', `${formatMonth(payment.periodStart)} - ${formatMonth(payment.periodEnd)}`, col2Ex, currentY);
        currentY += 50;

        // Row 3
        drawLabelValue('Método de Pago', getMethodLabel(payment.method), col1Ex, currentY);
        drawLabelValue('Fecha de Pago', formatDate(payment.paymentDate), col2Ex, currentY);

        if (payment.reference) {
            currentY += 50;
            drawLabelValue('Referencia / Notas', payment.reference, col1Ex, currentY);
        }

        // --- FOOTER ---
        const footerY = 700;
        doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#E5E7EB').stroke();

        doc.fontSize(9).font('Helvetica').fillColor(COLORS.textLight);
        doc.text('Gracias por su pago.', 0, footerY + 15, { align: 'center' });
        doc.text(`Generado automáticamente por Proppio - ${companyName || 'Rent Manager'}`, 0, footerY + 30, { align: 'center' });
        doc.text('proppio.co', 0, footerY + 45, { align: 'center', link: 'https://proppio.co' });

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
