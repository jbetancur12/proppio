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
        return payment;
    }

    async update(id: string, data: UpdatePaymentDto): Promise<Payment> {
        const payment = await this.findOne(id);

        if (data.status) payment.status = data.status as PaymentStatus;
        if (data.reference !== undefined) payment.reference = data.reference;
        if (data.notes !== undefined) payment.notes = data.notes;

        await this.em.flush();
        return payment;
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
}
