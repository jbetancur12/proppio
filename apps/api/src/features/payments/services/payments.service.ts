import { EntityManager } from "@mikro-orm/core";
import { Payment, PaymentStatus, PaymentMethod } from "../entities/Payment";
import { CreatePaymentDto, UpdatePaymentDto } from "../dtos/payment.dto";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError";
import { Lease, LeaseStatus } from "../../leases/entities/Lease";

/**
 * PaymentsService - Business logic for payment management
 * Following design_guidelines.md section 2.1 Services Pattern
 */
export class PaymentsService {
    constructor(private readonly em: EntityManager) { }

    async findAll(): Promise<Payment[]> {
        return this.em.find(Payment, {}, {
            populate: ['lease', 'lease.unit', 'lease.renter'],
            orderBy: { paymentDate: 'DESC' }
        });
    }

    async findByLease(leaseId: string): Promise<Payment[]> {
        return this.em.find(Payment, { lease: { id: leaseId } }, {
            orderBy: { periodStart: 'DESC' }
        });
    }

    async findOne(id: string): Promise<Payment> {
        const payment = await this.em.findOne(Payment, { id }, { populate: ['lease', 'lease.unit', 'lease.renter'] });
        if (!payment) throw new NotFoundError('Pago no encontrado');
        return payment;
    }

    async create(data: CreatePaymentDto): Promise<Payment> {
        // Validate lease exists and is active
        const lease = await this.em.findOne(Lease, { id: data.leaseId });
        if (!lease) throw new ValidationError('Contrato no encontrado');
        if (lease.status !== LeaseStatus.ACTIVE) {
            throw new ValidationError('Solo se pueden registrar pagos en contratos activos');
        }

        const payment = new Payment({
            lease,
            amount: data.amount,
            paymentDate: new Date(data.paymentDate),
            periodStart: new Date(data.periodStart),
            periodEnd: new Date(data.periodEnd),
            method: data.method as PaymentMethod,
            reference: data.reference,
            notes: data.notes,
            status: PaymentStatus.COMPLETED
        });

        await this.em.persistAndFlush(payment);

        // Send Email Receipt
        await this.sendReceiptNotification(payment);

        return payment;
    }

    async update(id: string, data: UpdatePaymentDto): Promise<Payment> {
        const payment = await this.findOne(id);
        const previousStatus = payment.status;

        if (data.status) payment.status = data.status as PaymentStatus;
        if (data.reference !== undefined) payment.reference = data.reference;
        if (data.notes !== undefined) payment.notes = data.notes;
        if (data.paymentDate) payment.paymentDate = new Date(data.paymentDate);
        if (data.method) payment.method = data.method as PaymentMethod;

        await this.em.flush();

        // Send receipt if status changed to COMPLETED
        if (previousStatus !== PaymentStatus.COMPLETED && payment.status === PaymentStatus.COMPLETED) {
            await this.sendReceiptNotification(payment);
        }

        return payment;
    }

    private async sendReceiptNotification(payment: Payment) {
        try {
            const fullPayment = await this.em.findOne(Payment, { id: payment.id }, { populate: ['lease', 'lease.renter', 'lease.unit'] });
            if (fullPayment && fullPayment.lease?.renter) {
                // Send email if available
                if (fullPayment.lease.renter.email) {
                    const { EmailService } = await import('../../../shared/services/EmailService');
                    const emailService = new EmailService();
                    emailService.sendPaymentReceipt(fullPayment).catch(console.error);
                }

                // Send WhatsApp if available
                if (fullPayment.lease.renter.phone) {
                    const { WhatsAppService } = await import('../../../shared/services/WhatsAppService');
                    const whatsappService = new WhatsAppService();
                    whatsappService.sendPaymentReceipt(fullPayment).catch(console.error);
                }
            }
        } catch (error) {
            console.error('Error sending receipt notifications:', error);
        }
    }

    async getPaymentSummary(leaseId: string): Promise<{ total: number; count: number }> {
        const payments = await this.em.find(Payment, {
            lease: { id: leaseId },
            status: PaymentStatus.COMPLETED
        });

        return {
            total: payments.reduce((sum, p) => sum + p.amount, 0),
            count: payments.length
        };
    }
    async delete(id: string): Promise<void> {
        const payment = await this.findOne(id);

        // Optional: Add logic to restrict deletion of COMPLETED payments if needed
        // For now, allow deletion but perhaps we should check status?
        // if (payment.status === PaymentStatus.COMPLETED) ...

        await this.em.removeAndFlush(payment);
    }
}
