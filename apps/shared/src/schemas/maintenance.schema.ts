import { z } from 'zod';

export const TicketStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export type TicketStatusType = z.infer<typeof TicketStatusEnum>;

export const TicketPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type TicketPriorityType = z.infer<typeof TicketPriorityEnum>;

export const createTicketSchema = z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    unitId: z.string().uuid('Debes seleccionar una unidad válida'),
    priority: TicketPriorityEnum.optional(),
    reportedById: z.string().uuid().optional(),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;

export const updateTicketSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: TicketStatusEnum.optional(),
    priority: TicketPriorityEnum.optional(),
    resolvedAt: z.string().datetime().optional()
});

export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
