import { Entity, Property, ManyToOne, Enum } from "@mikro-orm/core";
import { BaseTenantEntity } from "../../../shared/entities/BaseTenantEntity";
import { UnitEntity } from "../../properties/entities/Unit";
import { Renter } from "../../renters/entities/Renter";

export enum LeaseStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    TERMINATED = 'TERMINATED'
}

@Entity({ tableName: 'leases' })
export class Lease extends BaseTenantEntity {

    @ManyToOne({ entity: 'UnitEntity', type: 'string' })
    unit!: UnitEntity;

    @ManyToOne({ entity: 'Renter', type: 'string' })
    renter!: Renter;

    @Property({ type: 'date' })
    startDate!: Date;

    @Property({ type: 'date' })
    endDate!: Date;

    @Property({ type: 'number' })
    monthlyRent!: number;

    @Property({ type: 'number', nullable: true })
    securityDeposit?: number;

    @Enum({ items: () => LeaseStatus, type: 'string', default: LeaseStatus.DRAFT })
    status: LeaseStatus = LeaseStatus.DRAFT;

    @Property({ type: 'string', nullable: true })
    notes?: string;

    constructor(partial?: Partial<Lease>) {
        super();
        Object.assign(this, partial);
    }
}
