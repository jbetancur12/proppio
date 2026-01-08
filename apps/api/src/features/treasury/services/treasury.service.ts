import { EntityManager } from '@mikro-orm/core';
import { Payment, PaymentStatus } from '../../payments/entities/Payment';
import { Expense, ExpenseStatus } from '../../expenses/entities/Expense';
import { TreasuryTransaction, TransactionType } from '../entities/TreasuryTransaction';

export interface UnifiedTransaction {
    id: string;
    date: Date;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    source: 'LEASE_PAYMENT' | 'PROPERTY_EXPENSE' | 'TREASURY';
    reference?: string;
}

export interface GlobalBalance {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
}

export class TreasuryService {
    constructor(private readonly em: EntityManager) { }

    async getGlobalBalance(): Promise<GlobalBalance> {
        // 1. Lease Payments (Income)
        const payments = await this.em.find(Payment, { status: PaymentStatus.COMPLETED });
        const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        // 2. Property Expenses (Expense)
        const expenses = await this.em.find(Expense, { status: ExpenseStatus.PAID });
        const totalPropertyExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        // 3. Treasury Transactions (Mixed)
        const treasuryTx = await this.em.find(TreasuryTransaction, {});
        const treasuryIncome = treasuryTx
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const treasuryExpenses = treasuryTx
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalIncome = totalPayments + treasuryIncome;
        const totalExpenses = totalPropertyExpenses + treasuryExpenses;

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses
        };
    }

    async getUnifiedTransactions(): Promise<UnifiedTransaction[]> {
        // Fetch all sources
        const [payments, expenses, treasuryTx] = await Promise.all([
            this.em.find(Payment, { status: PaymentStatus.COMPLETED }, { populate: ['lease', 'lease.unit'] }),
            this.em.find(Expense, { status: ExpenseStatus.PAID }, { populate: ['property'] }),
            this.em.find(TreasuryTransaction, {})
        ]);

        const unified: UnifiedTransaction[] = [];

        // Map Payments
        payments.forEach(p => {
            unified.push({
                id: p.id,
                date: p.paymentDate,
                amount: Number(p.amount),
                type: 'INCOME',
                category: 'RENT',
                description: `Pago Arriendo - ${p.lease.unit.name}`,
                source: 'LEASE_PAYMENT',
                reference: p.reference
            });
        });

        // Map Expenses
        expenses.forEach(e => {
            unified.push({
                id: e.id,
                date: e.date,
                amount: Number(e.amount),
                type: 'EXPENSE',
                category: e.category,
                description: `Gasto Propiedad - ${e.property?.name || 'General'}`,
                source: 'PROPERTY_EXPENSE',
                reference: e.description // Use description as reference or allow helper
            });
        });

        // Map Treasury Transactions
        treasuryTx.forEach(t => {
            unified.push({
                id: t.id,
                date: t.date,
                amount: Number(t.amount),
                type: t.type === TransactionType.INCOME ? 'INCOME' : 'EXPENSE',
                category: t.category,
                description: t.description || 'Movimiento de Tesorería',
                source: 'TREASURY',
                reference: t.reference
            });
        });

        // Sort by date desc
        return unified.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    async createTransaction(data: Partial<TreasuryTransaction>): Promise<TreasuryTransaction> {
        const tx = new TreasuryTransaction(data);
        await this.em.persistAndFlush(tx);
        return tx;
    }
}
