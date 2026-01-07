import { z } from 'zod';

export const createPropertySchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
});

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = createPropertySchema.partial();
export type UpdatePropertyDto = z.infer<typeof updatePropertySchema>;
