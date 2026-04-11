import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';
import { sendActivationEmail, sendAccountSuspendedEmail, sendAccountReactivatedEmail } from '../services/email.service';
import { config } from '../config';
import { slugify } from '../utils/slug';
import { clearTenantCache } from '../middleware/tenant';

// ─── Dashboard ───

export async function getStats(_req: Request, res: Response) {
  try {
    const [tenants, admins, orders, revenue] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
    ]);

    res.json({
      tenants,
      admins,
      orders,
      revenue: Number(revenue._sum.total || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

// ─── Tenants ───

export async function getTenants(req: Request, res: Response) {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { slug: { contains: String(search), mode: 'insensitive' } },
        { domain: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const take = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * take;

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          _count: { select: { users: true, products: true, orders: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    res.json({ tenants, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tenants' });
  }
}

export async function getTenantById(req: Request, res: Response) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        siteConfig: true,
        _count: { select: { users: true, products: true, orders: true, categories: true, coupons: true } },
        users: { where: { role: 'admin' }, select: { id: true, name: true, email: true, isActive: true, suspendedAt: true, lastLoginAt: true, createdAt: true } },
      },
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant no encontrado' });
    res.json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tenant' });
  }
}

export async function createTenant(req: Request, res: Response) {
  try {
    const { name, domain, slug: rawSlug, plan } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre es requerido' });

    const slug = rawSlug ? slugify(rawSlug) : slugify(name);

    const existing = await prisma.tenant.findFirst({
      where: { OR: [{ slug }, ...(domain ? [{ domain }] : [])] },
    });
    if (existing) return res.status(409).json({ error: 'Slug o dominio ya existe' });

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        domain: domain || null,
        plan: plan || 'free',
        status: 'active',
        siteConfig: { create: { siteName: name } },
      },
      include: { siteConfig: true },
    });

    clearTenantCache();
    res.status(201).json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear tenant' });
  }
}

export async function updateTenant(req: Request, res: Response) {
  try {
    const tenantId = Number(req.params.id);
    const { name, domain, plan } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (domain !== undefined) data.domain = domain || null;
    if (plan !== undefined) data.plan = plan;

    const tenant = await prisma.tenant.update({ where: { id: tenantId }, data });
    clearTenantCache();
    res.json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tenant' });
  }
}

export async function suspendTenant(req: Request, res: Response) {
  try {
    const tenantId = Number(req.params.id);
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'suspended' },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'suspend_tenant', entity: 'Tenant', entityId: tenantId, tenantId },
    });

    clearTenantCache();
    res.json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al suspender tenant' });
  }
}

export async function reactivateTenant(req: Request, res: Response) {
  try {
    const tenantId = Number(req.params.id);
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'active' },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'reactivate_tenant', entity: 'Tenant', entityId: tenantId, tenantId },
    });

    clearTenantCache();
    res.json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reactivar tenant' });
  }
}

export async function deleteTenant(req: Request, res: Response) {
  try {
    const tenantId = Number(req.params.id);
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Tenant no encontrado' });

    if (tenant.slug === 'default') {
      return res.status(400).json({ error: 'No se puede eliminar el tenant default' });
    }

    await prisma.tenant.delete({ where: { id: tenantId } });

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'delete_tenant', entity: 'Tenant', entityId: tenantId, details: { name: tenant.name, slug: tenant.slug } },
    });

    clearTenantCache();
    res.json({ message: 'Tenant eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar tenant' });
  }
}

// ─── Admin users management ───

export async function getAdmins(req: Request, res: Response) {
  try {
    const { tenantId: filterTenantId, search, page = '1', limit = '20' } = req.query;
    const where: any = { role: 'admin' };
    if (filterTenantId) where.tenantId = Number(filterTenantId);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const take = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * take;

    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true, isActive: true,
          tenantId: true, tenant: { select: { id: true, name: true, slug: true } },
          suspendedAt: true, suspendReason: true, lastLoginAt: true, activatedAt: true, createdAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ admins, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener admins' });
  }
}

export async function createAdmin(req: Request, res: Response) {
  try {
    const { email, name, tenantId, activeImmediately } = req.body;
    if (!email || !name || !tenantId) {
      return res.status(400).json({ error: 'Email, nombre y tenantId son requeridos' });
    }

    const immediate = Boolean(activeImmediately);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'El email ya está registrado' });

    const tenant = await prisma.tenant.findUnique({ where: { id: Number(tenantId) } });
    if (!tenant) return res.status(404).json({ error: 'Tenant no encontrado' });

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const activationToken = crypto.randomBytes(32).toString('hex');
    const hashed = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: 'admin',
        tenantId: Number(tenantId),
        isActive: immediate,
        activationToken: immediate ? null : activationToken,
        activatedAt: immediate ? new Date() : null,
      },
    });

    if (!immediate) {
      const activationUrl = `${config.appUrl}/api/auth/activate/${activationToken}`;
      void sendActivationEmail({ to: email, name, activationUrl, tempPassword });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId, action: 'create_admin', entity: 'User',
        entityId: user.id, tenantId: Number(tenantId), details: { email, name, activeImmediately: immediate },
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      ...(immediate ? { tempPassword } : {}),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear admin' });
  }
}

export async function updateAdmin(req: Request, res: Response) {
  try {
    const adminId = Number(req.params.id);
    const { name, email, tenantId } = req.body;

    const admin = await prisma.user.findFirst({ where: { id: adminId, role: 'admin' } });
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (tenantId !== undefined) data.tenantId = Number(tenantId);

    const updated = await prisma.user.update({ where: { id: adminId }, data });
    res.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role, tenantId: updated.tenantId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar admin' });
  }
}

export async function suspendAdmin(req: Request, res: Response) {
  try {
    const adminId = Number(req.params.id);
    const { reason } = req.body;

    const admin = await prisma.user.findFirst({ where: { id: adminId, role: 'admin' } });
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    await prisma.user.update({
      where: { id: adminId },
      data: { suspendedAt: new Date(), suspendReason: reason || 'Suspendido por el super administrador' },
    });

    void sendAccountSuspendedEmail({ to: admin.email, name: admin.name, reason: reason || '' });

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'suspend_admin', entity: 'User', entityId: adminId, tenantId: admin.tenantId, details: { reason } },
    });

    res.json({ message: 'Admin suspendido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al suspender admin' });
  }
}

export async function reactivateAdmin(req: Request, res: Response) {
  try {
    const adminId = Number(req.params.id);

    const admin = await prisma.user.findFirst({ where: { id: adminId, role: 'admin' } });
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    await prisma.user.update({
      where: { id: adminId },
      data: { suspendedAt: null, suspendReason: null },
    });

    void sendAccountReactivatedEmail({ to: admin.email, name: admin.name });

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'reactivate_admin', entity: 'User', entityId: adminId, tenantId: admin.tenantId },
    });

    res.json({ message: 'Admin reactivado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reactivar admin' });
  }
}

export async function deleteAdmin(req: Request, res: Response) {
  try {
    const adminId = Number(req.params.id);

    const admin = await prisma.user.findFirst({ where: { id: adminId, role: 'admin' } });
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    await prisma.user.delete({ where: { id: adminId } });

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'delete_admin', entity: 'User', entityId: adminId, tenantId: admin.tenantId, details: { email: admin.email, name: admin.name } },
    });

    res.json({ message: 'Admin eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar admin' });
  }
}

export async function resendActivation(req: Request, res: Response) {
  try {
    const adminId = Number(req.params.id);

    const admin = await prisma.user.findFirst({ where: { id: adminId, role: 'admin' } });
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    if (admin.isActive) return res.status(400).json({ error: 'La cuenta ya está activa' });

    const activationToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: adminId }, data: { activationToken } });

    const activationUrl = `${config.appUrl}/api/auth/activate/${activationToken}`;
    void sendActivationEmail({ to: admin.email, name: admin.name, activationUrl, tempPassword: null });

    res.json({ message: 'Email de activación reenviado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reenviar activación' });
  }
}

// ─── Audit log ───

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, Number(page));
    const take = Math.min(200, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count(),
    ]);

    res.json({ logs, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener logs' });
  }
}
