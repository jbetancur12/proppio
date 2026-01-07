import { Entity, Property, ManyToOne, Enum, Rel } from "@mikro-orm/core";
import { BaseTenantEntity } from "../../../shared/entities/BaseTenantEntity";
import { PropertyEntity } from "../../properties/entities/Property";
import { UnitEntity } from "../../properties/entities/Unit";

export enum ExpenseCategory {
    MAINTENANCE = 'MAINTENANCE', // Mantenimiento general
    REPAIRS = 'REPAIRS',         // Reparaciones específicas
    UTILITIES = 'UTILITIES',     // Servicios públicos
    TAXES = 'TAXES',             // Impuestos
    MANAGEMENT = 'MANAGEMENT',   // Administración/Comisión
    INSURANCE = 'INSURANCE',     // Seguros
    OTHER = 'OTHER'
}

export enum ExpenseStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}

@Entity({ tableName: 'expenses' })
export class Expense extends BaseTenantEntity {

    @Property({ type: 'string' })
    description!: string;

    @Property({ type: 'number' })
    amount!: number;

    @Property({ type: 'date' })
    date!: Date;

    @Enum({ items: () => ExpenseCategory, type: 'string', default: ExpenseCategory.MAINTENANCE })
    category: ExpenseCategory = ExpenseCategory.MAINTENANCE;

    @Enum({ items: () => ExpenseStatus, type: 'string', default: ExpenseStatus.PENDING })
    status: ExpenseStatus = ExpenseStatus.PENDING;

    @ManyToOne({ entity: 'PropertyEntity', ref: true })
    property!: Rel<PropertyEntity>;

    @ManyToOne({ entity: 'UnitEntity', ref: true, nullable: true })
    unit?: Rel<UnitEntity>;

    @Property({ type: 'string', nullable: true })
    supplier?: string; // Proveedor del servicio

    @Property({ type: 'string', nullable: true })
    invoiceNumber?: string; // Número de factura

    constructor(partial?: Partial<Expense>) {
        super();
        Object.assign(this, partial);
    }
}
