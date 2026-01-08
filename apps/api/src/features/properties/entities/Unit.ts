import { Entity, Property, ManyToOne, Rel, Enum } from '@mikro-orm/core';
import { BaseTenantEntity } from '../../../shared/entities/BaseTenantEntity';
import { PropertyEntity } from './Property';

export enum UnitStatus {
    VACANT = 'VACANT',
    OCCUPIED = 'OCCUPIED',
    MAINTENANCE = 'MAINTENANCE'
}

@Entity({ tableName: 'units' })
export class UnitEntity extends BaseTenantEntity {
    @Property({ type: 'string' })
    name!: string;

    @Property({ nullable: true, type: 'string' })
    type?: string; // Appt, Room, House, Local

    @Property({ nullable: true, type: 'number' })
    area?: number;

    @Property({ nullable: true, type: 'number' })
    bedrooms?: number;

    @Property({ nullable: true, type: 'number' })
    bathrooms?: number;

    @Enum({ items: () => UnitStatus, type: 'string', default: UnitStatus.VACANT })
    status: UnitStatus = UnitStatus.VACANT;

    @Property({ nullable: true, type: 'number' })
    baseRent?: number; // Canon base mensual

    @ManyToOne({ entity: 'PropertyEntity', ref: true })
    property!: Rel<PropertyEntity>;
}
