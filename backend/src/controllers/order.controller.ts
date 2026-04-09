import { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma';
import { sendOrderConfirmation } from '../services/email.service';

function shippingAddressToStrings(addr: unknown): Record<string, string> {
  if (!addr || typeof addr !== 'object') return {};
  return Object.fromEntries(
    Object.entries(addr as Record<string, unknown>).map(([k, v]) => [k, v == null ? '' : String(v)]),
  );
}

const orderIncludes = {
  items: { include: { product: { include: { images: { take: 1 } } }, variant: true } },
  user: { select: { id: true, name: true, email: true } },
};

export async function createOrder(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { shippingAddress, paymentMethod, shippingOptionId } = req.body;
    const userId = req.user!.userId;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId, tenantId },
      include: { product: true, variant: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    let total = new Prisma.Decimal(0);
    const orderItems = cartItems.map((item) => {
      const basePrice = item.variant
        ? new Prisma.Decimal(item.product.price.toString()).add(new Prisma.Decimal(item.variant.priceAdjust.toString()))
        : item.product.salePrice || item.product.price;
      const lineTotal = new Prisma.Decimal(basePrice.toString()).mul(item.quantity);
      total = total.add(lineTotal);

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: basePrice,
      };
    });

    const order = await prisma.order.create({
      data: {
        tenantId,
        userId,
        total,
        shippingAddress: shippingAddress || {},
        shippingOption: shippingOptionId || '',
        paymentMethod: paymentMethod || '',
        items: { create: orderItems },
      },
      include: orderIncludes,
    });

    await prisma.cartItem.deleteMany({ where: { userId, tenantId } });

    const emailTo = order.user?.email;
    if (emailTo) {
      void sendOrderConfirmation({
        to: emailTo,
        orderId: order.id,
        items: order.items.map((i) => ({
          name: i.product?.name ?? 'Producto',
          quantity: i.quantity,
          price: Number(i.unitPrice),
        })),
        total: Number(order.total),
        shippingAddress: shippingAddressToStrings(order.shippingAddress),
        paymentMethod: order.paymentMethod || '',
      });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear orden' });
  }
}

export async function createGuestOrder(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { items, shippingAddress, shippingOptionId, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No hay items en el pedido' });
    }
    if (!shippingAddress?.fullName || !shippingAddress?.email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }

    const productIds = items.map((i: any) => Number(i.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId, active: true },
      include: { variants: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = new Prisma.Decimal(0);
    const orderItems = items.map((item: any) => {
      const product = productMap.get(Number(item.productId));
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

      const variant = item.variantId
        ? product.variants.find((v) => v.id === Number(item.variantId))
        : null;

      const basePrice = variant
        ? new Prisma.Decimal(product.price.toString()).add(new Prisma.Decimal(variant.priceAdjust.toString()))
        : product.salePrice || product.price;

      const lineTotal = new Prisma.Decimal(basePrice.toString()).mul(Number(item.quantity));
      total = total.add(lineTotal);

      return {
        productId: product.id,
        variantId: variant?.id || null,
        quantity: Number(item.quantity),
        unitPrice: basePrice,
      };
    });

    const order = await prisma.order.create({
      data: {
        tenantId,
        guestEmail: shippingAddress.email,
        guestName: shippingAddress.fullName,
        total,
        shippingAddress,
        shippingOption: shippingOptionId || '',
        paymentMethod: paymentMethod || '',
        items: { create: orderItems },
      },
      include: orderIncludes,
    });

    void sendOrderConfirmation({
      to: String(shippingAddress.email),
      orderId: order.id,
      items: order.items.map((i) => ({
        name: i.product?.name ?? 'Producto',
        quantity: i.quantity,
        price: Number(i.unitPrice),
      })),
      total: Number(order.total),
      shippingAddress: shippingAddressToStrings(order.shippingAddress),
      paymentMethod: order.paymentMethod || '',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear orden' });
  }
}

export async function getMyOrders(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId, tenantId },
      include: orderIncludes,
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const order = await prisma.order.findFirst({
      where: { id: Number(req.params.id), tenantId },
      include: orderIncludes,
    });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    const role = req.user!.role;
    if (role !== 'admin' && role !== 'super_admin' && order.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
}

export async function getAllOrders(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { status, page = '1', limit = '20' } = req.query;
    const where: any = { tenantId };
    if (status) where.status = String(status);

    const pageNum = Math.max(1, Number(page));
    const take = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * take;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, include: orderIncludes, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const orderId = Number(req.params.id);

    const existing = await prisma.order.findFirst({ where: { id: orderId, tenantId } });
    if (!existing) return res.status(404).json({ error: 'Orden no encontrada' });

    const { status, paymentStatus } = req.body;
    const data: any = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: orderId },
      data,
      include: orderIncludes,
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
}
