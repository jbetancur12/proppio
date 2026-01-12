import { EntityManager } from '@mikro-orm/core';
import { logger } from '../../../shared/logger';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, GlobalRole } from '../entities/User';
import { TenantUser } from '../entities/TenantUser';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { UnauthorizedError, ValidationError } from '../../../shared/errors/AppError';
import { AuditLogService } from '../../admin/services/audit-log.service';

export class AuthService {
    constructor(private readonly em: EntityManager) {}

    /**
     * Login - Supports both Super Admin and regular users
     */
    async login(dto: LoginDto) {
        // Find user by email
        const user = await this.em.findOne(User, { email: dto.email });
        if (!user) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        // Verify password
        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        const audit = new AuditLogService(this.em);

        // Check if Super Admin
        if (user.globalRole === GlobalRole.SUPER_ADMIN) {
            // Super Admin: Token WITHOUT tenantId
            const payload = {
                userId: user.id,
                email: user.email,
                globalRole: GlobalRole.SUPER_ADMIN,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

            // Log login audit
            await audit.log({
                action: 'LOGIN',
                userId: user.id,
                details: { role: GlobalRole.SUPER_ADMIN },
            });

            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    globalRole: user.globalRole,
                },
            };
        }

        // Regular user: Check tenant association
        const tenantUsers = await this.em.find(TenantUser, { user: user.id }, { populate: ['tenant'] });

        if (tenantUsers.length === 0) {
            throw new UnauthorizedError('Usuario no asociado a ningún tenant');
        }

        // For now, use first tenant (in future, allow user to select)
        const tenantUser = tenantUsers[0];

        const payload = {
            userId: user.id,
            tenantId: tenantUser.tenant.id,
            role: tenantUser.role,
            email: user.email,
            features: tenantUser.tenant.config?.features || {},
            timezone: tenantUser.tenant.config?.timezone || 'America/Bogota',
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        // Log login audit
        await audit.log({
            action: 'LOGIN',
            userId: user.id,
            tenantId: tenantUser.tenant.id,
            details: { role: tenantUser.role },
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                tenantId: tenantUser.tenant.id,
                tenantName: tenantUser.tenant.name,
                role: tenantUser.role,
                features: tenantUser.tenant.config?.features || {},
                timezone: tenantUser.tenant.config?.timezone || 'America/Bogota',
            },
        };
    }

    /**
     * Register a new user (for tenant members)
     */
    async register(dto: RegisterDto, tenantId: string) {
        // Check if email already exists
        const existing = await this.em.findOne(User, { email: dto.email });
        if (existing) {
            throw new ValidationError('Email ya está registrado');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = new User({
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            globalRole: GlobalRole.USER,
        });

        await this.em.persistAndFlush(user);

        // Audit Log (need to construct service manually since we are in AuthService)
        // We can reuse the import if not circular, but AuthService is in 'auth' and AuditLogService in 'admin'.
        // To avoid circular dependency issues at module level, dynamic import or just using the class if standard import works.
        // Earlier I used dynamic import in PropertiesService. I'll do the same here to be safe.
        try {
            const audit = new AuditLogService(this.em);
            await audit.log({
                action: 'REGISTER_USER',
                resourceType: 'User',
                resourceId: user.id,
                newValues: { email: user.email, globalRole: user.globalRole },
                // If register is called by a logged in user (e.g. admin adding member), context should have userId.
                // If it's public registration (not implemented yet), then userId might be null, but AuditLogService expects context.
                // For tenant member addition, it's usually an authenticated action.
            });
        } catch (error) {
            logger.error({ err: error }, 'Audit log failed for register user');
        }

        return { message: 'Usuario creado exitosamente' };
    }
    async changePassword(userId: string, dto: any) {
        const user = await this.em.findOne(User, { id: userId });
        if (!user) {
            throw new UnauthorizedError('Usuario no encontrado');
        }

        const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedError('La contraseña actual es incorrecta');
        }

        user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.em.flush();

        // Audit Log
        try {
            const audit = new AuditLogService(this.em);
            await audit.log({
                action: 'CHANGE_PASSWORD',
                resourceType: 'User',
                resourceId: user.id,
                userId: user.id, // Self-change
                details: { method: 'user_initiated' },
            });
        } catch (error) {
            logger.error({ err: error }, 'Audit log failed for password change');
        }

        return { message: 'Contraseña actualizada exitosamente' };
    }
}
