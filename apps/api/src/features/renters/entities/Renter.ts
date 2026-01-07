import { Entity, Property } from "@mikro-orm/core";
import { BaseTenantEntity } from "../../../shared/entities/BaseTenantEntity";

@Entity({ tableName: 'renters' })
export class Renter extends BaseTenantEntity {

    @Property({ type: 'string' })
    firstName!: string;

    @Property({ type: 'string' })
    lastName!: string;

    @Property({ type: 'string', nullable: true })
    email?: string;

    @Property({ type: 'string' })
    phone!: string;

    @Property({ type: 'string' })
    identification!: string; // CC, DNI, Passport

    constructor(partial?: Partial<Renter>) {
        super();
        Object.assign(this, partial);
    }
}
