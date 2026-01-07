import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import { Tenant, TenantStatus } from '../../tenants/entities/Tenant';
import { User, GlobalRole } from '../../auth/entities/User';
import { TenantUser, TenantRole } from '../../auth/entities/TenantUser';
import { ValidationError } from '../../../shared/errors/AppError';

export interface CreateTenantDto {
    name: string;
    slug: string;
    plan?: string;
    adminUser: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    };
}

export class TenantProvisioningService {
    constructor(private readonly em: EntityManager) { }

    async createTenant(data: CreateTenantDto): Promise<Tenant> {
        // Check if slug is unique
        const existingTenant = await this.em.findOne(Tenant, { slug: data.slug });
        if (existingTenant) {
            throw new ValidationError('El slug ya está en uso');
        }

        // Check if admin email is unique
        const existingUser = await this.em.findOne(User, { email: data.adminUser.email });
        if (existingUser) {
            throw new ValidationError('El email ya está registrado');
        }

        // Create tenant
        const tenant = new Tenant();
        tenant.name = data.name;
        tenant.slug = data.slug;
        tenant.status = TenantStatus.ACTIVE;
        tenant.plan = data.plan || 'FREE';

        // Create admin user
        const passwordHash = await bcrypt.hash(data.adminUser.password, 10);
        const adminUser = new User({
            email: data.adminUser.email,
            passwordHash,
            firstName: data.adminUser.firstName,
            lastName: data.adminUser.lastName,
            globalRole: GlobalRole.USER
        });

        // Link user to tenant as ADMIN
        const tenantUser = new TenantUser({
            tenant,
            user: adminUser,
            role: TenantRole.ADMIN
        });

        // Persist all in transaction
        await this.em.persistAndFlush([tenant, adminUser, tenantUser]);

        return tenant;
    }
}
