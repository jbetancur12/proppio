import { z } from 'zod';

export const createUnitSchema = z.object({
    propertyId: z.string().uuid(),
    name: z.string().min(1, "Name is required"),
    type: z.string().optional(),
    area: z.number().optional(),
});

export type CreateUnitDto = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = createUnitSchema.partial().omit({ propertyId: true });
export type UpdateUnitDto = z.infer<typeof updateUnitSchema>;
