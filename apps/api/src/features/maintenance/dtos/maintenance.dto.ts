import { z } from 'zod';
import { TicketStatus, TicketPriority } from '../entities/MaintenanceTicket';

export const createTicketSchema = z.object({
    title: z.string().min(3, 'El título es muy corto'),
    description: z.string().min(10, 'La descripción es muy corta'),
    unitId: z.string().uuid('ID de unidad inválido'),
    priority: z.nativeEnum(TicketPriority).optional(),
    reportedById: z.string().uuid().optional(),
});

export const updateTicketSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.nativeEnum(TicketStatus).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    resolvedAt: z.string().datetime().optional()
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
