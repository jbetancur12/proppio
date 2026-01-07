import { EntityManager, FilterQuery } from "@mikro-orm/core";
import { MaintenanceTicket, TicketStatus } from "../entities/MaintenanceTicket";
import { CreateTicketDto, UpdateTicketDto } from "../dtos/maintenance.dto";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError";
import { UnitEntity } from "../../properties/entities/Unit";
import { Renter } from "../../renters/entities/Renter";

export class MaintenanceService {
    constructor(private readonly em: EntityManager) { }

    async findAll(filters: { status?: string, unitId?: string } = {}): Promise<MaintenanceTicket[]> {
        const where: FilterQuery<MaintenanceTicket> = {};
        if (filters.status && filters.status !== 'ALL') where.status = filters.status as TicketStatus;
        if (filters.unitId) where.unit = { id: filters.unitId } as any;

        return this.em.find(MaintenanceTicket, where, { populate: ['unit', 'unit.property', 'reportedBy'], orderBy: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<MaintenanceTicket> {
        const ticket = await this.em.findOne(MaintenanceTicket, { id }, { populate: ['unit', 'unit.property', 'reportedBy'] });
        if (!ticket) throw new NotFoundError('Ticket no encontrado');
        return ticket;
    }

    async create(data: CreateTicketDto): Promise<MaintenanceTicket> {
        const unit = await this.em.findOne(UnitEntity, { id: data.unitId });
        if (!unit) throw new ValidationError('Unidad no encontrada');

        let reporter: Renter | undefined;
        if (data.reportedById) {
            reporter = await this.em.findOne(Renter, { id: data.reportedById }) || undefined;
        }

        const ticket = new MaintenanceTicket({
            title: data.title,
            description: data.description,
            unit,
            reportedBy: reporter,
            priority: data.priority,
            status: TicketStatus.OPEN
        });

        await this.em.persistAndFlush(ticket);
        return ticket;
    }

    async update(id: string, data: UpdateTicketDto): Promise<MaintenanceTicket> {
        const ticket = await this.findOne(id);

        if (data.title) ticket.title = data.title;
        if (data.description) ticket.description = data.description;
        if (data.priority) ticket.priority = data.priority;

        if (data.status) {
            ticket.status = data.status;
            if (data.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
                ticket.resolvedAt = new Date();
            }
        }

        await this.em.flush();
        return ticket;
    }

    async updateStatus(id: string, status: TicketStatus): Promise<MaintenanceTicket> {
        return this.update(id, { status });
    }
}
