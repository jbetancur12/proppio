import { Entity, Property, ManyToOne, Enum } from "@mikro-orm/core";
import { BaseTenantEntity } from "../../../shared/entities/BaseTenantEntity";
import { Lease } from "./Lease";

export enum ExitNoticeStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED'
}

@Entity({ tableName: 'exit_notices' })
export class ExitNotice extends BaseTenantEntity {

    @ManyToOne({ entity: 'Lease', type: 'string' })
    lease!: Lease;

    @Property({ type: 'date' })
    noticeDate!: Date;

    @Property({ type: 'date' })
    plannedExitDate!: Date;

    @Property({ type: 'text', nullable: true })
    reason?: string;

    @Property({ type: 'boolean', default: false })
    mutualAgreement: boolean = false;

    @Property({ type: 'number', nullable: true })
    penaltyAmount?: number;

    @Property({ type: 'boolean', default: false })
    penaltyWaived: boolean = false;

    @Enum({ items: () => ExitNoticeStatus, type: 'string', default: ExitNoticeStatus.PENDING })
    status: ExitNoticeStatus = ExitNoticeStatus.PENDING;

    constructor(partial?: Partial<ExitNotice>) {
        super();
        Object.assign(this, partial);
    }
}
