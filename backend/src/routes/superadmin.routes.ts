import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth';
import {
  getStats,
  getTenants, getTenantById, createTenant, updateTenant, suspendTenant, reactivateTenant, deleteTenant,
  getAdmins, createAdmin, updateAdmin, suspendAdmin, reactivateAdmin, deleteAdmin, resendActivation,
  getAuditLogs,
} from '../controllers/superadmin.controller';
import {
  getTenantOrders,
  getTenantOrderById,
  getTenantCustomers,
} from '../controllers/superadmin-tenant-data.controller';

const router = Router();

router.use(authenticate, requireSuperAdmin);

router.get('/stats', getStats);

router.get('/tenants', getTenants);
router.post('/tenants', createTenant);
router.get('/tenants/:tenantId/customers', getTenantCustomers);
router.get('/tenants/:tenantId/orders', getTenantOrders);
router.get('/tenants/:tenantId/orders/:orderId', getTenantOrderById);
router.get('/tenants/:id', getTenantById);
router.put('/tenants/:id', updateTenant);
router.put('/tenants/:id/suspend', suspendTenant);
router.put('/tenants/:id/reactivate', reactivateTenant);
router.delete('/tenants/:id', deleteTenant);

router.get('/admins', getAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.put('/admins/:id/suspend', suspendAdmin);
router.put('/admins/:id/reactivate', reactivateAdmin);
router.delete('/admins/:id', deleteAdmin);
router.post('/admins/:id/resend-activation', resendActivation);

router.get('/audit-logs', getAuditLogs);

export default router;
