import { Entity, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { BaseTenantEntity } from '../../../shared/entities/BaseTenantEntity';
import { UnitEntity } from './Unit';

@Entity({ tableName: 'properties' })
export class PropertyEntity extends BaseTenantEntity {
    @Property({ type: 'string' })
    name!: string;

    @Property({ type: 'string' })
    address!: string;

    @OneToMany({ entity: 'UnitEntity', mappedBy: 'property', cascade: [Cascade.ALL], orphanRemoval: true })
    units = new Collection<UnitEntity>(this);
}
