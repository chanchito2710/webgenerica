import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { orderIncludes } from '../lib/orderIncludes';

export async function getTenantOrders(req: Request, res: Response) {
  try {
    const tenantId = Number(req.params.tenantId);
    if (Number.isNaN(tenantId)) return res.status(400).json({ error: 'tenantId inválido' });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Tienda no encontrada' });

    const { status, page = '1', limit = '20' } = req.query;
    const where: { tenantId: number; status?: string } = { tenantId };
    if (status) where.status = String(status);

    const pageNum = Math.max(1, Number(page));
    const take = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * take;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderIncludes,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
}

export async function getTenantOrderById(req: Request, res: Response) {
  try {
    const tenantId = Number(req.params.tenantId);
    const orderId = Number(req.params.orderId);
    if (Number.isNaN(tenantId) || Number.isNaN(orderId)) {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Tienda no encontrada' });

    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: orderIncludes,
    });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
}

export async function getTenantCustomers(req: Request, res: Response) {
  try {
    const tenantId = Number(req.params.tenantId);
    if (Number.isNaN(tenantId)) return res.status(400).json({ error: 'tenantId inválido' });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Tienda no encontrada' });

    const { search, page = '1', limit = '20' } = req.query;
    const where: {
      tenantId: number;
      role: string;
      OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { email: { contains: string; mode: 'insensitive' } }>;
    } = { tenantId, role: 'customer' };

    if (search) {
      const q = String(search);
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const take = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * take;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ customers, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
}
