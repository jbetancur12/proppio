import { z } from 'zod';

export const createPropertySchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
});

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = createPropertySchema.partial();
export type UpdatePropertyDto = z.infer<typeof updatePropertySchema>;
