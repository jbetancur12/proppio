import { z } from 'zod';

export const createContractTemplateSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    content: z.string().min(1, 'El contenido es requerido'),
    isActive: z.boolean().optional(),
});

export const updateContractTemplateSchema = createContractTemplateSchema.partial();

export type CreateContractTemplateDto = z.infer<typeof createContractTemplateSchema>;
export type UpdateContractTemplateDto = z.infer<typeof updateContractTemplateSchema>;
