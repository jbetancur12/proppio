import { z } from 'zod';

export const createUnitSchema = z.object({
    propertyId: z.string().uuid("ID de propiedad inválido"),
    name: z.string().min(1, "El nombre es requerido"),
    type: z.string().optional(),
    area: z.number({ invalid_type_error: "El área debe ser un número" }).positive("El área debe ser positiva").optional(),
    bedrooms: z.number({ invalid_type_error: "Las habitaciones deben ser un número" }).int("Las habitaciones deben ser un número entero").nonnegative("Las habitaciones no pueden ser negativas").optional(),
    bathrooms: z.number({ invalid_type_error: "Los baños deben ser un número" }).nonnegative("Los baños no pueden ser negativos").optional(),
    baseRent: z.number({ invalid_type_error: "El canon base debe ser un número" }).positive("El canon base debe ser positivo").optional(),
});

export type CreateUnitDto = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = createUnitSchema.partial().omit({ propertyId: true });
export type UpdateUnitDto = z.infer<typeof updateUnitSchema>;
