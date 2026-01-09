import 'reflect-metadata'; // Required for ReflectMetadataProvider in production
import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core'; // Changed to @mikro-orm/core as it's the main package
import { PostgreSqlDriver } from '@mikro-orm/postgresql'; // Use driver specific types if needed, or core
import config from './mikro-orm.config';
import http from 'http';

// Entities
import { User } from './features/auth/entities/User';
import { Tenant } from './features/tenants/entities/Tenant';
import { PropertyEntity } from './features/properties/entities/Property';
import { UnitEntity } from './features/properties/entities/Unit';
import { Renter } from './features/renters/entities/Renter';
import { Lease } from './features/leases/entities/Lease';
import { Payment } from './features/payments/entities/Payment';
import { Expense } from './features/expenses/entities/Expense';
import { MaintenanceTicket } from './features/maintenance/entities/MaintenanceTicket';
import { RentIncrease } from './features/leases/entities/RentIncrease';
import { TenantUser } from './features/auth/entities/TenantUser';
import { AuditLog } from './features/admin/entities/AuditLog';
import { ExitNotice } from './features/leases/entities/ExitNotice';
import { TreasuryTransaction } from './features/treasury/entities/TreasuryTransaction';

export const DI = {} as {
    server: http.Server;
    orm: MikroORM;
    em: EntityManager;

    // Repositories
    users: EntityRepository<User>;
    tenants: EntityRepository<Tenant>;
    properties: EntityRepository<PropertyEntity>;
    units: EntityRepository<UnitEntity>;
    renters: EntityRepository<Renter>;
    leases: EntityRepository<Lease>;
    payments: EntityRepository<Payment>;
    expenses: EntityRepository<Expense>;
    maintenanceTickets: EntityRepository<MaintenanceTicket>;
    rentIncreases: EntityRepository<RentIncrease>;
    tenantUsers: EntityRepository<TenantUser>;
    auditLogs: EntityRepository<AuditLog>;
    exitNotices: EntityRepository<ExitNotice>;
    treasuryTransactions: EntityRepository<TreasuryTransaction>;
};

export const initDI = async (): Promise<typeof DI> => {
    DI.orm = await MikroORM.init(config);
    DI.em = DI.orm.em;

    // Initialize repositories
    DI.users = DI.orm.em.getRepository(User);
    DI.tenants = DI.orm.em.getRepository(Tenant);
    DI.properties = DI.orm.em.getRepository(PropertyEntity);
    DI.units = DI.orm.em.getRepository(UnitEntity);
    DI.renters = DI.orm.em.getRepository(Renter);
    DI.leases = DI.orm.em.getRepository(Lease);
    DI.payments = DI.orm.em.getRepository(Payment);
    DI.expenses = DI.orm.em.getRepository(Expense);
    DI.maintenanceTickets = DI.orm.em.getRepository(MaintenanceTicket);
    DI.rentIncreases = DI.orm.em.getRepository(RentIncrease);
    DI.tenantUsers = DI.orm.em.getRepository(TenantUser);
    DI.auditLogs = DI.orm.em.getRepository(AuditLog);
    DI.exitNotices = DI.orm.em.getRepository(ExitNotice);
    DI.treasuryTransactions = DI.orm.em.getRepository(TreasuryTransaction);

    return DI;
};
