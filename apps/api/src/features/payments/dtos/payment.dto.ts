import { z } from 'zod';

export const createPaymentSchema = z.object({
    leaseId: z.string().uuid("ID de contrato inválido"),
    amount: z.number().positive("El monto debe ser mayor a 0"),
    paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha de pago inválida"),
    periodStart: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha de inicio de período inválida"),
    periodEnd: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha de fin de período inválida"),
    method: z.enum(['CASH', 'TRANSFER', 'CHECK', 'CARD', 'OTHER']).default('TRANSFER'),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentDto = z.infer<typeof updatePaymentSchema>;
