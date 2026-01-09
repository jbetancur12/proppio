import { Entity, Property, ManyToOne, Enum, OneToMany, Collection } from "@mikro-orm/core";
import { BaseTenantEntity } from "../../../shared/entities/BaseTenantEntity";
import { UnitEntity } from "../../properties/entities/Unit";
import { Renter } from "../../renters/entities/Renter";
import { Payment } from "../../payments/entities/Payment";

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

    @Property({ type: 'string', nullable: true })
    contractPdfPath?: string;

    @Property({ type: 'date', nullable: true })
    originalEndDate?: Date;

    @Property({ type: 'number', default: 0 })
    renewalCount: number = 0;

    @Property({ type: 'number', default: 90 })
    noticeRequiredDays: number = 90;

    @Property({ type: 'number', nullable: true })
    earlyTerminationPenalty?: number;

    @Property({ type: 'date', nullable: true })
    lastIncreaseDate?: Date;

    @Property({ type: 'date', nullable: true })
    firstPaymentDate?: Date;

    @OneToMany(() => Payment, payment => payment.lease)
    payments = new Collection<Payment>(this);

    constructor(partial?: Partial<Lease>) {
        super();
        Object.assign(this, partial);
    }
}
