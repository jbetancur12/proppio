import { Entity, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { BaseTenantEntity } from '../../../shared/entities/BaseTenantEntity';
import { PropertyEntity } from './Property';

@Entity({ tableName: 'units' })
export class UnitEntity extends BaseTenantEntity {
    @Property({ type: 'string' })
    name!: string;

    @Property({ nullable: true, type: 'string' })
    type?: string; // Appt, Room, House, Local

    @Property({ nullable: true, type: 'number' })
    area?: number;

    @ManyToOne({ entity: 'PropertyEntity', ref: true })
    property!: Rel<PropertyEntity>;
}
