import { Router } from 'express';
import { AdminController } from './controllers/admin.controller';
import { requireSuperAdmin } from './middlewares/requireSuperAdmin';

const router = Router();
const controller = new AdminController();

// Apply Super Admin requirement to all admin routes
router.use(requireSuperAdmin);

// Tenants
router.get('/tenants', (req, res, next) => controller.listTenants(req, res, next));
router.get('/tenants/:id', (req, res, next) => controller.getTenant(req, res, next));
router.post('/tenants', (req, res, next) => controller.createTenant(req, res, next));
router.patch('/tenants/:id/status', (req, res, next) => controller.updateTenantStatus(req, res, next));

// Users
router.get('/users', (req, res, next) => controller.listUsers(req, res, next));

// Metrics
router.get('/metrics/global', (req, res, next) => controller.getGlobalMetrics(req, res, next));

// Audit Logs
router.get('/audit-logs', (req, res, next) => controller.getAuditLogs(req, res, next));

export default router;
