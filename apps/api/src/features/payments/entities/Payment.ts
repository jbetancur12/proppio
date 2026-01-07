import { Entity, Property, ManyToOne, Enum } from "@mikro-orm/core";
import { BaseTenantEntity } from "../../../shared/entities/BaseTenantEntity";
import { Lease } from "../../leases/entities/Lease";

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
    CASH = 'CASH',
    TRANSFER = 'TRANSFER',
    CHECK = 'CHECK',
    CARD = 'CARD',
    OTHER = 'OTHER'
}

@Entity({ tableName: 'payments' })
export class Payment extends BaseTenantEntity {

    @ManyToOne({ entity: 'Lease', type: 'string' })
    lease!: Lease;

    @Property({ type: 'number' })
    amount!: number;

    @Property({ type: 'date' })
    paymentDate!: Date;

    @Property({ type: 'date' })
    periodStart!: Date; // What month this covers

    @Property({ type: 'date' })
    periodEnd!: Date;

    @Enum({ items: () => PaymentMethod, type: 'string', default: PaymentMethod.TRANSFER })
    method: PaymentMethod = PaymentMethod.TRANSFER;

    @Enum({ items: () => PaymentStatus, type: 'string', default: PaymentStatus.COMPLETED })
    status: PaymentStatus = PaymentStatus.COMPLETED;

    @Property({ type: 'string', nullable: true })
    reference?: string; // Bank reference, receipt number

    @Property({ type: 'string', nullable: true })
    notes?: string;

    constructor(partial?: Partial<Payment>) {
        super();
        Object.assign(this, partial);
    }
}
