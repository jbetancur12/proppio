import { EntityManager } from "@mikro-orm/core";
import { Lease, LeaseStatus } from "../entities/Lease";
import { CreateLeaseDto, UpdateLeaseDto } from "../dtos/lease.dto";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError";
import { UnitEntity, UnitStatus } from "../../properties/entities/Unit";
import { Renter } from "../../renters/entities/Renter";
import puppeteer from 'puppeteer';

/**
 * LeaseService - Business logic for lease management
 * Following design_guidelines.md section 2.1 Services Pattern
 */
export class LeasesService {
    constructor(private readonly em: EntityManager) { }

    async findAll(): Promise<Lease[]> {
        return this.em.find(Lease, {}, { populate: ['unit', 'renter'] });
    }

    async findOne(id: string): Promise<Lease> {
        const lease = await this.em.findOne(Lease, { id }, { populate: ['unit', 'renter', 'unit.property'] });
        if (!lease) throw new NotFoundError('Contrato no encontrado');
        return lease;
    }

    async create(data: CreateLeaseDto): Promise<Lease> {
        // Validate unit exists
        const unit = await this.em.findOne(UnitEntity, { id: data.unitId });
        if (!unit) throw new ValidationError('Unidad no encontrada');
        if (unit.status !== UnitStatus.VACANT) {
            throw new ValidationError('La unidad no está disponible (Ocupada o en Mantenimiento)');
        }

        // Validate renter exists
        const renter = await this.em.findOne(Renter, { id: data.renterId });
        if (!renter) throw new ValidationError('Inquilino no encontrado');

        // Check for overlapping active leases on same unit
        const existingLease = await this.em.findOne(Lease, {
            unit: { id: data.unitId },
            status: { $in: [LeaseStatus.ACTIVE, LeaseStatus.DRAFT] },
            $or: [
                { startDate: { $lte: new Date(data.endDate) }, endDate: { $gte: new Date(data.startDate) } }
            ]
        });
        if (existingLease) {
            throw new ValidationError('Ya existe un contrato activo para esta unidad en el período indicado');
        }

        const lease = new Lease({
            unit,
            renter,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            monthlyRent: data.monthlyRent,
            securityDeposit: data.securityDeposit,
            notes: data.notes,
            status: LeaseStatus.DRAFT,
            firstPaymentDate: data.firstPaymentDate ? new Date(data.firstPaymentDate) : undefined,
            contractContent: data.contractContent
        });

        await this.em.persistAndFlush(lease);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'CREATE_LEASE',
                resourceType: 'Lease',
                resourceId: lease.id,
                newValues: { ...data, unitId: data.unitId, renterId: data.renterId }
            });
        } catch (error) {
            console.error('Audit log failed for create lease:', error);
        }

        if (data.contractContent) {
            const pdfKey = await this.generateAndUploadPdf(lease.id, data.contractContent);
            lease.contractPdfPath = pdfKey;
            await this.em.flush();
        }

        return lease;
    }

    async update(id: string, data: UpdateLeaseDto): Promise<Lease> {
        const lease = await this.findOne(id);
        const oldValues = { ...lease }; // Shallow copy of entity state significantly restricted, better to map if possible, but for audit strictness maybe acceptable

        if (data.startDate) lease.startDate = new Date(data.startDate);
        if (data.endDate) lease.endDate = new Date(data.endDate);
        if (data.monthlyRent !== undefined) lease.monthlyRent = data.monthlyRent;
        if (data.securityDeposit !== undefined) lease.securityDeposit = data.securityDeposit;
        if (data.status) lease.status = data.status as LeaseStatus;
        if (data.notes !== undefined) lease.notes = data.notes;
        if (data.contractContent !== undefined) lease.contractContent = data.contractContent;

        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'UPDATE_LEASE',
                resourceType: 'Lease',
                resourceId: lease.id,
                oldValues: {
                    startDate: oldValues.startDate,
                    endDate: oldValues.endDate,
                    monthlyRent: oldValues.monthlyRent,
                    securityDeposit: oldValues.securityDeposit,
                    status: oldValues.status,
                    notes: oldValues.notes
                },
                newValues: data
            });
        } catch (error) {
            console.error('Audit log failed for update lease:', error);
        }

        if (data.contractContent) {
            const pdfKey = await this.generateAndUploadPdf(lease.id, data.contractContent);
            lease.contractPdfPath = pdfKey;
            await this.em.flush();
        }

        return lease;
    }

    async activate(id: string): Promise<Lease> {
        const lease = await this.findOne(id);
        if (lease.status !== LeaseStatus.DRAFT) {
            throw new ValidationError('Solo contratos en borrador pueden activarse');
        }

        const oldStatus = lease.status;
        lease.status = LeaseStatus.ACTIVE;

        // Auto-update unit status to OCCUPIED
        const unit = await this.em.findOne(UnitEntity, { id: lease.unit.id });
        if (unit) {
            unit.status = UnitStatus.OCCUPIED;
        }

        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'ACTIVATE_LEASE',
                resourceType: 'Lease',
                resourceId: lease.id,
                oldValues: { status: oldStatus },
                newValues: { status: LeaseStatus.ACTIVE }
            });
        } catch (error) {
            console.error('Audit log failed for activate lease:', error);
        }

        return lease;
    }

    async terminate(id: string): Promise<Lease> {
        const lease = await this.findOne(id);
        if (lease.status !== LeaseStatus.ACTIVE) {
            throw new ValidationError('Solo contratos activos pueden terminarse');
        }

        const oldStatus = lease.status;
        lease.status = LeaseStatus.TERMINATED;

        // Auto-update unit status to VACANT
        const unit = await this.em.findOne(UnitEntity, { id: lease.unit.id });
        if (unit) {
            unit.status = UnitStatus.VACANT;
        }

        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'TERMINATE_LEASE',
                resourceType: 'Lease',
                resourceId: lease.id,
                oldValues: { status: oldStatus },
                newValues: { status: LeaseStatus.TERMINATED }
            });
        } catch (error) {
            console.error('Audit log failed for terminate lease:', error);
        }

        return lease;
    }

    async findExpiring(days: number = 60): Promise<Lease[]> {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return this.em.find(Lease, {
            status: LeaseStatus.ACTIVE,
            endDate: { $gte: today, $lte: futureDate }
        }, {
            populate: ['unit', 'renter', 'unit.property'],
            orderBy: { endDate: 'ASC' }
        });
    }

    async updateContractPdf(id: string, filePath: string): Promise<Lease> {
        const lease = await this.findOne(id);

        // If there's an existing file, delete it first to keep storage clean
        if (lease.contractPdfPath) {
            const bucketName = process.env.STORAGE_BUCKET || 'rent-manager-documents';
            const { storageService } = await import('../../../shared/services/storage.service');
            await storageService.deleteFile(bucketName, lease.contractPdfPath);
        }

        lease.contractPdfPath = filePath;
        await this.em.flush();
        return lease;
    }

    async deleteContractPdf(id: string): Promise<Lease> {
        const lease = await this.findOne(id);

        if (!lease.contractPdfPath) {
            throw new ValidationError('El contrato no tiene un archivo PDF adjunto');
        }

        // Delete from S3
        const bucketName = process.env.STORAGE_BUCKET || 'rent-manager-documents';
        const { storageService } = await import('../../../shared/services/storage.service');
        await storageService.deleteFile(bucketName, lease.contractPdfPath);

        // Update DB
        lease.contractPdfPath = undefined;
        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'DELETE_LEASE_CONTRACT',
                resourceType: 'Lease',
                resourceId: lease.id,
                oldValues: { contractPdfPath: 'DELETED' },
                newValues: { contractPdfPath: null }
            });
        } catch (error) {
            console.error('Audit log failed for delete contract pdf:', error);
        }

        return lease;
    }

    private async generateAndUploadPdf(leaseId: string, htmlContent: string): Promise<string> {
        let browser;
        try {
            browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

            const bucketName = process.env.STORAGE_BUCKET || 'rent-manager-documents';
            const { storageService } = await import('../../../shared/services/storage.service');
            await storageService.ensureBucket(bucketName);

            const key = `leases/${leaseId}/contract.pdf`;
            await storageService.uploadBuffer(bucketName, key, Buffer.from(pdfBuffer), 'application/pdf');

            return key;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Error al generar el PDF del contrato');
        } finally {
            if (browser) await browser.close();
        }
    }
}
