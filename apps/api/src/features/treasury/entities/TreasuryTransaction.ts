import { Entity, Property, Enum } from '@mikro-orm/core';
import { BaseTenantEntity } from '../../../shared/entities/BaseTenantEntity';

export enum TransactionType {
    INCOME = 'INCOME', // Ingreso
    EXPENSE = 'EXPENSE' // Egreso
}

export enum TransactionCategory {
    // Ingresos
    INVESTMENT = 'INVESTMENT', // Inversión / Aporte de Capital
    LOAN = 'LOAN', // Préstamo Recibido
    REFUND = 'REFUND', // Reembolso
    OTHER_INCOME = 'OTHER_INCOME',

    // Egresos
    SALARY = 'SALARY', // Nómina
    TAXES = 'TAXES', // Impuestos
    SERVICES = 'SERVICES', // Servicios Públicos (no atados a propiedad)
    MARKETING = 'MARKETING', // Publicidad
    LEGAL = 'LEGAL', // Gastos Legales
    OFFICE = 'OFFICE', // Gastos de Oficina
    WITHDRAWAL = 'WITHDRAWAL', // Retiro de Utilidades
    OTHER_EXPENSE = 'OTHER_EXPENSE'
}

@Entity({ tableName: 'treasury_transactions' })
export class TreasuryTransaction extends BaseTenantEntity {

    @Property({ type: 'date' })
    date!: Date;

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    amount!: number;

    @Enum(() => TransactionType)
    type!: TransactionType;

    @Enum(() => TransactionCategory)
    category!: TransactionCategory;

    @Property({ type: 'text', nullable: true })
    description?: string;

    @Property({ type: 'string', nullable: true })
    reference?: string;

    constructor(partial?: Partial<TreasuryTransaction>) {
        super();
        Object.assign(this, partial);
    }
}
