import { Entity, Property } from '@mikro-orm/core';
import { BaseTenantEntity } from '../../../shared/entities/BaseTenantEntity';

@Entity({ tableName: 'properties' })
export class PropertyEntity extends BaseTenantEntity {
    @Property()
    name!: string;

    @Property()
    address!: string;
}
