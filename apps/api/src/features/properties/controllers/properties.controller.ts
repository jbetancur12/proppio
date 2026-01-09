import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { PropertiesService } from '../services/properties.service';
import { createPropertySchema, updatePropertySchema } from '../dtos/property.dto';
import { logger } from '../../../shared/logger';

export class PropertiesController {

    private getService(): PropertiesService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new PropertiesService(em);
    }

    async list(req: Request, res: Response) {
        try {
            const service = this.getService();
            const properties = await service.findAll();
            res.json(properties);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching properties', error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const validation = createPropertySchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ errors: validation.error.errors });
                return;
            }

            const user = (req as any).user;
            if (!user || !user.tenantId) {
                res.status(403).json({ message: 'Tenant context required' });
                return;
            }

            const service = this.getService();
            const property = await service.create(validation.data, user.tenantId);
            res.status(201).json(property);
        } catch (error) {
            res.status(500).json({ message: 'Error creating property', error });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const service = this.getService();
            const property = await service.findOne(req.params.id);
            res.json(property);
        } catch (error) {
            res.status(404).json({ message: 'Property not found' });
        }
    }

    async getStats(req: Request, res: Response) {
        try {
            const service = this.getService();
            const stats = await service.getStats(req.params.id);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching property stats', error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const service = this.getService();
            await service.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            logger.error({ err: error, propertyId: req.params.id }, 'Failed to delete property');

            // Check if it's a business logic error (active leases)
            if (error.message?.includes('contrato')) {
                res.status(400).json({ message: error.message });
            } else if (error.message === 'Property not found') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Error deleting property', error: error.message });
            }
        }
    }
}
