import { Entity, Property, ManyToOne } from '@mikro-orm/core';
import { BaseTenantEntity } from '../../../shared/entities/BaseTenantEntity';
import { Lease } from '../../leases/entities/Lease';

@Entity({ tableName: 'rent_increases' })
export class RentIncrease extends BaseTenantEntity {

    @ManyToOne({ entity: 'Lease', type: 'string' })
    lease!: Lease;

    @Property({ type: 'number' })
    oldRent!: number;

    @Property({ type: 'number' })
    newRent!: number;

    @Property({ type: 'number' })
    increasePercentage!: number;

    @Property({ type: 'date' })
    effectiveDate!: Date;

    @Property({ type: 'string', nullable: true })
    reason?: string;

    @Property({ type: 'string' })
    appliedBy!: string; // User ID who applied the increase

    constructor(partial?: Partial<RentIncrease>) {
        super();
        Object.assign(this, partial);
    }
}
