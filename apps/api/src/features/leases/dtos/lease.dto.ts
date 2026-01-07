import { z } from 'zod';

export const createLeaseSchema = z.object({
    unitId: z.string().uuid("ID de unidad inválido"),
    renterId: z.string().uuid("ID de inquilino inválido"),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha de inicio inválida"),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha de fin inválida"),
    monthlyRent: z.number().positive("El canon debe ser mayor a 0"),
    securityDeposit: z.number().nonnegative().optional(),
    notes: z.string().optional(),
});

export const updateLeaseSchema = z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha inválida").optional(),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha inválida").optional(),
    monthlyRent: z.number().positive().optional(),
    securityDeposit: z.number().nonnegative().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']).optional(),
    notes: z.string().optional(),
});

export type CreateLeaseDto = z.infer<typeof createLeaseSchema>;
export type UpdateLeaseDto = z.infer<typeof updateLeaseSchema>;
