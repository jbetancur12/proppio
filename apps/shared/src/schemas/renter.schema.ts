import { z } from 'zod';

export const createRenterSchema = z.object({
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
    identification: z.string().min(5, "La identificación debe tener al menos 5 caracteres"),
});

export const updateRenterSchema = createRenterSchema.partial();

export type CreateRenterDto = z.infer<typeof createRenterSchema>;
export type UpdateRenterDto = z.infer<typeof updateRenterSchema>;
