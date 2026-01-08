import { EntityManager } from '@mikro-orm/core';
import { ExitNotice, ExitNoticeStatus } from '../entities/ExitNotice';
import { Lease } from '../entities/Lease';
import { getContext } from '../../../shared/utils/RequestContext';
import { ValidationError } from '../../../shared/errors/AppError';
import { AuditLogService } from '../../admin/services/audit-log.service';
import { LeaseRenewalService } from './lease-renewal.service';

export interface CreateExitNoticeDto {
    leaseId: string;
    plannedExitDate: Date;
    reason?: string;
    mutualAgreement?: boolean;
}

export class ExitNoticeService {
    constructor(private readonly em: EntityManager) { }

    /**
     * Create an exit notice for a lease
     */
    async createExitNotice(data: CreateExitNoticeDto): Promise<ExitNotice> {
        const { tenantId, userId } = getContext();
        const lease = await this.em.findOne(Lease, { id: data.leaseId });

        if (!lease) {
            throw new ValidationError('Contrato no encontrado');
        }

        // Validate advance notice period
        const today = new Date();
        const plannedExitDate = new Date(data.plannedExitDate);
        const daysNotice = Math.ceil((plannedExitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysNotice < lease.noticeRequiredDays) {
            throw new ValidationError(
                `Se requiere un aviso de ${lease.noticeRequiredDays} días. Solo proporcionó ${daysNotice} días.`
            );
        }

        // Calculate penalty if applicable
        const renewalService = new LeaseRenewalService(this.em);
        const isInFirstYear = renewalService.isInFirstYear(lease);
        let penaltyAmount: number | undefined;
        let penaltyWaived = false;

        if (isInFirstYear && !data.mutualAgreement) {
            penaltyAmount = lease.earlyTerminationPenalty || lease.monthlyRent * 2; // Default: 2 months rent
        } else if (data.mutualAgreement) {
            penaltyWaived = true;
        }

        // Create exit notice
        const exitNotice = new ExitNotice({
            lease,
            noticeDate: today,
            plannedExitDate,
            reason: data.reason,
            mutualAgreement: data.mutualAgreement || false,
            penaltyAmount,
            penaltyWaived,
            status: ExitNoticeStatus.PENDING
        });

        await this.em.persistAndFlush(exitNotice);

        // Log to audit
        const auditService = new AuditLogService(this.em);
        await auditService.log({
            action: 'EXIT_NOTICE_CREATED',
            resourceType: 'ExitNotice',
            resourceId: exitNotice.id,
            oldValues: null,
            newValues: { leaseId: lease.id, plannedExitDate, penaltyAmount },
            performedBy: userId || 'UNKNOWN'
        });

        return exitNotice;
    }

    /**
     * Confirm exit notice and update lease end date
     */
    async confirmExitNotice(noticeId: string): Promise<void> {
        const { userId } = getContext();
        const exitNotice = await this.em.findOne(ExitNotice, { id: noticeId }, { populate: ['lease'] });

        if (!exitNotice) {
            throw new ValidationError('Aviso de salida no encontrado');
        }

        if (exitNotice.status !== ExitNoticeStatus.PENDING) {
            throw new ValidationError('El aviso ya fue procesado');
        }

        // Update lease end date
        const lease = exitNotice.lease;
        const oldEndDate = lease.endDate;
        lease.endDate = exitNotice.plannedExitDate;

        // Update notice status
        exitNotice.status = ExitNoticeStatus.CONFIRMED;

        await this.em.flush();

        // Log to audit
        const auditService = new AuditLogService(this.em);
        await auditService.log({
            action: 'EXIT_NOTICE_CONFIRMED',
            resourceType: 'Lease',
            resourceId: lease.id,
            oldValues: { endDate: oldEndDate },
            newValues: { endDate: lease.endDate },
            performedBy: userId || 'UNKNOWN'
        });
    }

    /**
     * Get all exit notices for a lease
     */
    async getExitNotices(leaseId: string): Promise<ExitNotice[]> {
        return this.em.find(
            ExitNotice,
            { lease: { id: leaseId } },
            { orderBy: { noticeDate: 'DESC' } }
        );
    }

    /**
     * Calculate penalty for early termination
     */
    calculatePenalty(lease: Lease, exitDate: Date): number {
        const renewalService = new LeaseRenewalService(this.em);
        const isInFirstYear = renewalService.isInFirstYear(lease);

        if (!isInFirstYear) {
            return 0;
        }

        return lease.earlyTerminationPenalty || lease.monthlyRent * 2;
    }

    /**
     * Cancel an exit notice
     */
    async cancelExitNotice(noticeId: string): Promise<void> {
        const { userId } = getContext();
        const exitNotice = await this.em.findOne(ExitNotice, { id: noticeId });

        if (!exitNotice) {
            throw new ValidationError('Aviso de salida no encontrado');
        }

        exitNotice.status = ExitNoticeStatus.CANCELLED;
        await this.em.flush();

        // Log to audit
        const auditService = new AuditLogService(this.em);
        await auditService.log({
            action: 'EXIT_NOTICE_CANCELLED',
            resourceType: 'ExitNotice',
            resourceId: exitNotice.id,
            oldValues: { status: ExitNoticeStatus.PENDING },
            newValues: { status: ExitNoticeStatus.CANCELLED },
            performedBy: userId || 'UNKNOWN'
        });
    }
}
