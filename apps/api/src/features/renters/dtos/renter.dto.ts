import { z } from 'zod';

export const createRenterSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    phone: z.string().min(7, "Phone number is too short"),
    identification: z.string().min(5, "Identification is too short"),
});

export const updateRenterSchema = createRenterSchema.partial();

export type CreateRenterDto = z.infer<typeof createRenterSchema>;
export type UpdateRenterDto = z.infer<typeof updateRenterSchema>;
