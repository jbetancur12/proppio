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

    async getUnifiedTransactions(filters: { startDate?: Date; endDate?: Date; page?: number; limit?: number } = {}): Promise<{ data: UnifiedTransaction[], total: number }> {
        const { startDate, endDate, page = 1, limit = 50 } = filters;

        const wherePayment: any = { status: PaymentStatus.COMPLETED };
        const whereExpense: any = { status: ExpenseStatus.PAID };
        const whereTreasury: any = {};

        if (startDate) {
            wherePayment.paymentDate = { $gte: new Date(startDate) };
            whereExpense.date = { $gte: new Date(startDate) };
            whereTreasury.date = { $gte: new Date(startDate) };
        }

        if (endDate) {
            const end = new Date(endDate);
            wherePayment.paymentDate = { ...wherePayment.paymentDate, $lte: end };
            whereExpense.date = { ...whereExpense.date, $lte: end };
            whereTreasury.date = { ...whereTreasury.date, $lte: end };
        }

        // Fetch filtered sources
        const [payments, expenses, treasuryTx] = await Promise.all([
            this.em.find(Payment, wherePayment, { populate: ['lease', 'lease.unit'] }),
            this.em.find(Expense, whereExpense, { populate: ['property'] }),
            this.em.find(TreasuryTransaction, whereTreasury)
        ]);

        const unified: UnifiedTransaction[] = [];

        // Map Payments
        payments.forEach(p => {
            try {
                unified.push({
                    id: p.id,
                    date: new Date(p.paymentDate),
                    amount: Number(p.amount),
                    type: 'INCOME',
                    category: 'RENT',
                    description: `Pago Arriendo - ${p.lease?.unit?.name || 'N/A'}`,
                    source: 'LEASE_PAYMENT',
                    reference: p.reference
                });
            } catch (err) {
                console.error('Error mapping payment:', p.id, err);
            }
        });

        // Map Expenses
        expenses.forEach(e => {
            unified.push({
                id: e.id,
                date: new Date(e.date),
                amount: Number(e.amount),
                type: 'EXPENSE',
                category: e.category,
                description: `Gasto Propiedad - ${e.property?.name || 'General'}`,
                source: 'PROPERTY_EXPENSE',
                reference: e.description
            });
        });

        // Map Treasury Transactions
        treasuryTx.forEach(t => {
            unified.push({
                id: t.id,
                date: new Date(t.date),
                amount: Number(t.amount),
                type: t.type === TransactionType.INCOME ? 'INCOME' : 'EXPENSE',
                category: t.category,
                description: t.description || 'Movimiento de Tesorería',
                source: 'TREASURY',
                reference: t.reference
            });
        });

        // Sort by date desc
        unified.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Pagination (In-Memory)
        const total = unified.length;
        console.log('Total unified records before pagination:', total);

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const slicedData = unified.slice(startIndex, endIndex);

        return {
            data: slicedData,
            total
        };
    }

    async createTransaction(data: Partial<TreasuryTransaction>): Promise<TreasuryTransaction> {
        const tx = new TreasuryTransaction(data);
        await this.em.persistAndFlush(tx);
        return tx;
    }
}
