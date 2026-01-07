import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, GlobalRole } from '../entities/User';
import { TenantUser } from '../entities/TenantUser';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { UnauthorizedError, ValidationError } from '../../../shared/errors/AppError';

export class AuthService {
    constructor(private readonly em: EntityManager) { }

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

        // Check if Super Admin
        if (user.globalRole === GlobalRole.SUPER_ADMIN) {
            // Super Admin: Token WITHOUT tenantId
            const payload = {
                userId: user.id,
                email: user.email,
                globalRole: GlobalRole.SUPER_ADMIN
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    globalRole: user.globalRole
                }
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
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                tenantId: tenantUser.tenant.id,
                tenantName: tenantUser.tenant.name,
                role: tenantUser.role
            }
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
            globalRole: GlobalRole.USER
        });

        await this.em.persistAndFlush(user);

        return { message: 'Usuario creado exitosamente' };
    }
}
