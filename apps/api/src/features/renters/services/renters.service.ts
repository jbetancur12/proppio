import { EntityManager } from "@mikro-orm/core";
import { Renter } from "../entities/Renter";
import { CreateRenterDto, UpdateRenterDto } from "../dtos/renter.dto";
import { AppError, NotFoundError, ValidationError } from "../../../shared/errors/AppError";

export class RentersService {
    constructor(private readonly em: EntityManager) { }

    async findAll(): Promise<Renter[]> {
        return this.em.find(Renter, {});
    }

    async findOne(id: string): Promise<Renter> {
        const renter = await this.em.findOne(Renter, { id });
        if (!renter) throw new NotFoundError('Renter not found');
        return renter;
    }

    async create(data: CreateRenterDto): Promise<Renter> {
        // Check for duplicates (identification)
        const existing = await this.em.findOne(Renter, { identification: data.identification });
        if (existing) {
            throw new ValidationError('A renter with this identification already exists.');
        }

        const renter = new Renter(data);
        await this.em.persistAndFlush(renter);
        return renter;
    }

    async update(id: string, data: UpdateRenterDto): Promise<Renter> {
        const renter = await this.findOne(id);

        // If updating identification, check uniqueness
        if (data.identification && data.identification !== renter.identification) {
            const existing = await this.em.findOne(Renter, { identification: data.identification });
            if (existing) throw new ValidationError('Identification already used by another renter.');
        }

        this.em.assign(renter, data);
        await this.em.flush();
        return renter;
    }

    async delete(id: string): Promise<void> {
        const renter = await this.findOne(id);
        await this.em.removeAndFlush(renter);
    }
}
