import { EntityManager, FilterQuery } from "@mikro-orm/core";
import { Expense, ExpenseCategory, ExpenseStatus } from "../entities/Expense";
import { CreateExpenseDto, UpdateExpenseDto } from "../dtos/expense.dto";
import { PropertyEntity } from "../../properties/entities/Property";
import { UnitEntity } from "../../properties/entities/Unit";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError";

export class ExpensesService {
    constructor(private readonly em: EntityManager) { }

    async findAll(propertyId?: string): Promise<Expense[]> {
        const where: FilterQuery<Expense> = {};
        if (propertyId) where.property = { id: propertyId } as any;
        return this.em.find(Expense, where, { populate: ['property', 'unit'], orderBy: { date: 'DESC' } });
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
            unit
        });

        await this.em.persistAndFlush(expense);
        return expense;
    }

    async update(id: string, data: UpdateExpenseDto): Promise<Expense> {
        const expense = await this.findOne(id);

        if (data.description) expense.description = data.description;
        if (data.amount) expense.amount = data.amount;
        if (data.date) expense.date = new Date(data.date);
        if (data.category) expense.category = data.category as ExpenseCategory;
        if (data.status) expense.status = data.status as ExpenseStatus;
        if (data.supplier !== undefined) expense.supplier = data.supplier;
        if (data.invoiceNumber !== undefined) expense.invoiceNumber = data.invoiceNumber;

        await this.em.flush();
        return expense;
    }

    async delete(id: string): Promise<void> {
        const expense = await this.findOne(id);
        await this.em.removeAndFlush(expense);
    }
}
