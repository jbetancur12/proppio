import { EntityManager } from "@mikro-orm/core";
import { PropertyEntity } from "../../properties/entities/Property";
import { UnitEntity, UnitStatus } from "../../properties/entities/Unit";
import { Renter } from "../../renters/entities/Renter";
import { Lease, LeaseStatus } from "../../leases/entities/Lease";
import { Payment, PaymentStatus } from "../../payments/entities/Payment";

export interface DashboardStats {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    totalRenters: number;
    activeLeases: number;
    monthlyExpectedIncome: number;
    monthlyReceivedIncome: number;
    collectionRate: number;
}

/**
 * StatsService - Dashboard KPI calculations
 * Following design_guidelines.md section 2.1 Services Pattern
 */
export class StatsService {
    constructor(private readonly em: EntityManager) { }

    async getDashboardStats(): Promise<DashboardStats> {
        // Counts
        const totalProperties = await this.em.count(PropertyEntity, {});
        const totalUnits = await this.em.count(UnitEntity, {});
        const occupiedUnits = await this.em.count(UnitEntity, { status: UnitStatus.OCCUPIED });
        const vacantUnits = await this.em.count(UnitEntity, { status: UnitStatus.VACANT });
        const totalRenters = await this.em.count(Renter, {});
        const activeLeases = await this.em.count(Lease, { status: LeaseStatus.ACTIVE });

        // Occupancy rate
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        // Monthly expected income (sum of all active lease monthly rents)
        const leases = await this.em.find(Lease, { status: LeaseStatus.ACTIVE });
        const monthlyExpectedIncome = leases.reduce((sum, l) => sum + l.monthlyRent, 0);

        // Monthly received income (sum of payments this month)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const payments = await this.em.find(Payment, {
            status: PaymentStatus.COMPLETED,
            paymentDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });
        const monthlyReceivedIncome = payments.reduce((sum, p) => sum + p.amount, 0);

        // Collection rate
        const collectionRate = monthlyExpectedIncome > 0
            ? Math.round((monthlyReceivedIncome / monthlyExpectedIncome) * 100)
            : 0;

        return {
            totalProperties,
            totalUnits,
            occupiedUnits,
            vacantUnits,
            occupancyRate,
            totalRenters,
            activeLeases,
            monthlyExpectedIncome,
            monthlyReceivedIncome,
            collectionRate
        };
    }
}
