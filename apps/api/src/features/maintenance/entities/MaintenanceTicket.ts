import { Entity, Property, ManyToOne, Enum, Collection, OneToMany } from "@mikro-orm/core";
import { BaseTenantEntity } from "../../../shared/entities/BaseTenantEntity";
import { UnitEntity } from "../../properties/entities/Unit";
import { Renter } from "../../renters/entities/Renter";

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

@Entity({ tableName: 'maintenance_tickets' })
export class MaintenanceTicket extends BaseTenantEntity {

    @Property({ type: 'string' })
    title!: string;

    @Property({ type: 'text' })
    description!: string;

    @Enum({ items: () => TicketStatus, type: 'string', default: TicketStatus.OPEN })
    status: TicketStatus = TicketStatus.OPEN;

    @Enum({ items: () => TicketPriority, type: 'string', default: TicketPriority.MEDIUM })
    priority: TicketPriority = TicketPriority.MEDIUM;

    @ManyToOne({ entity: 'UnitEntity' })
    unit!: UnitEntity;

    @ManyToOne({ entity: 'Renter', nullable: true, fieldName: 'renter_id' })
    reportedBy?: Renter;

    @Property({ type: 'json', nullable: true })
    images?: string[]; // Array of S3 keys

    @Property({ type: 'date', nullable: true })
    resolvedAt?: Date;

    constructor(partial?: Partial<MaintenanceTicket>) {
        super();
        Object.assign(this, partial);
    }
}
