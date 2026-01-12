import { Entity, Property } from "@mikro-orm/core";
import { BaseTenantEntity } from "../../../shared/entities/BaseTenantEntity";

@Entity({ tableName: 'contract_templates' })
export class ContractTemplate extends BaseTenantEntity {

    @Property({ type: 'string' })
    name!: string;

    @Property({ type: 'text' })
    content!: string;

    @Property({ type: 'boolean', default: true })
    isActive: boolean = true;
}
