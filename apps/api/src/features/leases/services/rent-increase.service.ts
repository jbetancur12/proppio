import { EntityManager } from '@mikro-orm/core';
import { Lease, LeaseStatus } from '../entities/Lease';
import { RentIncrease } from '../entities/RentIncrease';
import { getContext } from '../../../shared/utils/RequestContext';
import { ValidationError } from '../../../shared/errors/AppError';
import { ApplyIncreaseDto, BulkApplyIncreaseDto, IncreasePreview } from '../dtos/rent-increase.dto';

export class RentIncreaseService {
    constructor(private readonly em: EntityManager) { }

    /**
     * Calculate new rent based on percentage increase
     */
    calculateIncrease(currentRent: number, increasePercentage: number): number {
        const newRent = currentRent * (1 + increasePercentage / 100);
        return Math.round(newRent); // Round to nearest whole number
    }

    /**
     * Preview rent increases for all active leases
     */
    async previewIncreases(increasePercentage: number, targetDateStr?: string): Promise<IncreasePreview[]> {
        const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

        const leases = await this.em.find(
            Lease,
            { status: LeaseStatus.ACTIVE },
            { populate: ['unit', 'unit.property', 'renter'] }
        );

        // Calculate eligibility for each lease
        return leases.map(lease => {
            const referenceDate = lease.lastIncreaseDate ? new Date(lease.lastIncreaseDate) : new Date(lease.startDate);
            const nextIncreaseDate = new Date(referenceDate);
            nextIncreaseDate.setFullYear(nextIncreaseDate.getFullYear() + 1);

            // Check eligibility (ignore time portion for fair comparison)
            const isEligible = targetDate >= nextIncreaseDate;

            let rejectionReason: string | undefined;
            if (!isEligible) {
                const dateStr = nextIncreaseDate.toLocaleDateString('es-CO');
                rejectionReason = `Debe esperar hasta ${dateStr} (1 año desde ${lease.lastIncreaseDate ? 'último aumento' : 'inicio contrato'})`;
            }

            return {
                leaseId: lease.id,
                propertyName: (lease.unit.property as any)?.name ?? (lease.unit.property as any)?.getProperty?.('name') ?? 'N/A',
                unitName: lease.unit.name,
                renterName: `${lease.renter.firstName} ${lease.renter.lastName}`,
                currentRent: lease.monthlyRent,
                suggestedRent: this.calculateIncrease(lease.monthlyRent, increasePercentage),
                increasePercentage,
                lastIncreaseDate: lease.lastIncreaseDate,
                eligible: isEligible,
                rejectionReason
            };
        });
    }

    /**
     * Apply rent increase to a single lease
     */
    async applyIncrease(data: ApplyIncreaseDto): Promise<void> {
        const { tenantId, userId } = getContext();
        const lease = await this.em.findOne(Lease, { id: data.leaseId });

        if (!lease) {
            throw new ValidationError('Contrato no encontrado');
        }

        // Check if increase was already applied this year
        const effectiveYear = new Date(data.effectiveDate).getFullYear();
        if (lease.lastIncreaseDate) {
            const lastIncreaseYear = new Date(lease.lastIncreaseDate).getFullYear();
            if (lastIncreaseYear === effectiveYear) {
                throw new ValidationError(
                    `Ya se aplicó un aumento en ${effectiveYear} para este contrato`
                );
            }
        }

        const oldRent = lease.monthlyRent;

        // Create rent increase record
        const rentIncrease = new RentIncrease({
            lease,
            oldRent,
            newRent: data.newRent,
            increasePercentage: data.increasePercentage,
            effectiveDate: new Date(data.effectiveDate),
            reason: data.reason || `Aumento IPC ${data.increasePercentage}%`,
            appliedBy: userId
        });

        // Update lease
        lease.monthlyRent = data.newRent;
        lease.lastIncreaseDate = new Date(data.effectiveDate);

        await this.em.persistAndFlush([rentIncrease, lease]);
    }

    /**
     * Bulk apply rent increases
     */
    async bulkApplyIncreases(data: BulkApplyIncreaseDto): Promise<void> {
        for (const increase of data.increases) {
            await this.applyIncrease(increase);
        }
    }

    /**
     * Get rent increase history for a lease
     */
    async getLeaseIncreaseHistory(leaseId: string): Promise<RentIncrease[]> {
        return this.em.find(
            RentIncrease,
            { lease: { id: leaseId } },
            { orderBy: { effectiveDate: 'DESC' } }
        );
    }

    /**
     * Get IPC configuration for a year from tenant config
     */
    async getIPCForYear(year: number): Promise<number | null> {
        const { tenantId } = getContext();
        const { Tenant } = await import('../../tenants/entities/Tenant');

        const tenant = await this.em.findOne(Tenant, { id: tenantId });
        if (!tenant || !tenant.config) return null;

        const config = tenant.config as { ipcHistory?: Record<string, number> };
        return config.ipcHistory?.[year.toString()] || null;
    }

    /**
     * Set IPC for a year in tenant config
     */
    async setIPCForYear(year: number, ipcRate: number): Promise<void> {
        const { tenantId } = getContext();
        const { Tenant } = await import('../../tenants/entities/Tenant');

        const tenant = await this.em.findOne(Tenant, { id: tenantId });
        if (!tenant) throw new ValidationError('Tenant no encontrado');

        const config = (tenant.config as { ipcHistory?: Record<string, number> }) || {};
        if (!config.ipcHistory) {
            config.ipcHistory = {};
        }

        config.ipcHistory[year.toString()] = ipcRate;
        tenant.config = config as Record<string, unknown>;

        await this.em.flush();
    }
}
