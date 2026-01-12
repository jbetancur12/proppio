import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Expense, ExpenseCategory, ExpenseStatus } from '../entities/Expense';
import { CreateExpenseDto, UpdateExpenseDto } from '../dtos/expense.dto';
import { PropertyEntity } from '../../properties/entities/Property';
import { UnitEntity } from '../../properties/entities/Unit';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { PaginationDto, PaginatedResponse } from '../../../shared/dtos/pagination.dto';

export class ExpensesService {
    constructor(private readonly em: EntityManager) {}

    async findAll(query: PaginationDto & { propertyId?: string }): Promise<PaginatedResponse<Expense>> {
        const { page = 1, limit = 10, search, propertyId } = query;
        const offset = (page - 1) * limit;

        const where: FilterQuery<Expense> = {};
        if (propertyId) where.property = { id: propertyId } as any;

        if (search) {
            where.description = { $ilike: `%${search}%` };
        }

        const [items, total] = await this.em.findAndCount(Expense, where, {
            populate: ['property', 'unit'],
            orderBy: { date: 'DESC' },
            limit,
            offset,
        });

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<Expense> {
        const expense = await this.em.findOne(Expense, { id }, { populate: ['property', 'unit'] });
        if (!expense) throw new NotFoundError('Gasto no encontrado');
        return expense;
    }

    async create(data: CreateExpenseDto): Promise<Expense> {
        const property = await this.em.findOne(PropertyEntity, { id: data.propertyId });
        if (!property) throw new ValidationError('Propiedad no encontrada');

        let unit = undefined;
        if (data.unitId) {
            unit = await this.em.findOne(UnitEntity, { id: data.unitId });
            if (!unit) throw new ValidationError('Unidad no encontrada');
            // Verify unit belongs to property
            // Note: Relation is Unidirectional ManyToOne Unit->Property, so we check unit.property.id or load it
            // For now assuming the UI sends correct pair, but stricter check is better
        }

        const expense = new Expense({
            ...data,
            date: new Date(data.date),
            category: data.category as ExpenseCategory,
            status: data.status as ExpenseStatus,
            property,
            unit,
        });

        await this.em.persistAndFlush(expense);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'CREATE_EXPENSE',
                resourceType: 'Expense',
                resourceId: expense.id,
                newValues: data,
            });
        } catch (error) {
            console.error('Audit log failed for create expense:', error);
        }

        return expense;
    }

    async update(id: string, data: UpdateExpenseDto): Promise<Expense> {
        const expense = await this.findOne(id);
        const oldValues = {
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            status: expense.status,
        };

        if (data.description) expense.description = data.description;
        if (data.amount) expense.amount = data.amount;
        if (data.date) expense.date = new Date(data.date);
        if (data.category) expense.category = data.category as ExpenseCategory;
        if (data.status) expense.status = data.status as ExpenseStatus;
        if (data.supplier !== undefined) expense.supplier = data.supplier;
        if (data.invoiceNumber !== undefined) expense.invoiceNumber = data.invoiceNumber;

        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'UPDATE_EXPENSE',
                resourceType: 'Expense',
                resourceId: expense.id,
                oldValues,
                newValues: data,
            });
        } catch (error) {
            console.error('Audit log failed for update expense:', error);
        }

        return expense;
    }

    async delete(id: string): Promise<void> {
        const expense = await this.findOne(id);
        const expenseData = {
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
        };

        await this.em.removeAndFlush(expense);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'DELETE_EXPENSE',
                resourceType: 'Expense',
                resourceId: expenseData.id,
                oldValues: expenseData,
            });
        } catch (error) {
            console.error('Audit log failed for delete expense:', error);
        }
    }
}
