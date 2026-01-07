import { z } from 'zod';

export const createExpenseSchema = z.object({
    propertyId: z.string().uuid("ID de propiedad inválido"),
    unitId: z.string().uuid().optional(),
    description: z.string().min(3, "La descripción es requerida"),
    amount: z.number().positive("El monto debe ser mayor a 0"),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha inválida"),
    category: z.enum(['MAINTENANCE', 'REPAIRS', 'UTILITIES', 'TAXES', 'MANAGEMENT', 'INSURANCE', 'OTHER']),
    status: z.enum(['PENDING', 'PAID', 'CANCELLED']).default('PENDING'),
    supplier: z.string().optional(),
    invoiceNumber: z.string().optional(),
});

export const updateExpenseSchema = z.object({
    description: z.string().min(3).optional(),
    amount: z.number().positive().optional(),
    date: z.string().optional(),
    category: z.enum(['MAINTENANCE', 'REPAIRS', 'UTILITIES', 'TAXES', 'MANAGEMENT', 'INSURANCE', 'OTHER']).optional(),
    status: z.enum(['PENDING', 'PAID', 'CANCELLED']).optional(),
    supplier: z.string().optional(),
    invoiceNumber: z.string().optional(),
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
