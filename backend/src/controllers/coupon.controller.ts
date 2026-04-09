import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';

export const getCoupons: RequestHandler = async (req, res) => {
  const tenantId = req.tenantId!;
  const coupons = await prisma.coupon.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  res.json(coupons);
};

export const createCoupon: RequestHandler = async (req, res) => {
  const tenantId = req.tenantId!;
  const { code, type, value, minPurchase, maxUses, expiresAt, active } = req.body;
  const coupon = await prisma.coupon.create({
    data: {
      tenantId,
      code: String(code).toUpperCase().trim(),
      type: type || 'percentage',
      value: Number(value) || 0,
      minPurchase: Number(minPurchase) || 0,
      maxUses: Number(maxUses) || 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: active !== false,
    },
  });
  res.status(201).json(coupon);
};

export const updateCoupon: RequestHandler = async (req, res) => {
  const tenantId = req.tenantId!;
  const couponId = Number(req.params.id);

  const existing = await prisma.coupon.findFirst({ where: { id: couponId, tenantId } });
  if (!existing) { res.status(404).json({ error: 'Cupón no encontrado' }); return; }

  const { code, type, value, minPurchase, maxUses, expiresAt, active } = req.body;
  const coupon = await prisma.coupon.update({
    where: { id: couponId },
    data: {
      ...(code !== undefined && { code: String(code).toUpperCase().trim() }),
      ...(type !== undefined && { type }),
      ...(value !== undefined && { value: Number(value) }),
      ...(minPurchase !== undefined && { minPurchase: Number(minPurchase) }),
      ...(maxUses !== undefined && { maxUses: Number(maxUses) }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(active !== undefined && { active }),
    },
  });
  res.json(coupon);
};

export const deleteCoupon: RequestHandler = async (req, res) => {
  const tenantId = req.tenantId!;
  const couponId = Number(req.params.id);

  const existing = await prisma.coupon.findFirst({ where: { id: couponId, tenantId } });
  if (!existing) { res.status(404).json({ error: 'Cupón no encontrado' }); return; }

  await prisma.coupon.delete({ where: { id: couponId } });
  res.json({ message: 'Cupón eliminado' });
};

export const validateCoupon: RequestHandler = async (req, res) => {
  const tenantId = req.tenantId!;
  const { code, cartTotal } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Código requerido' });
    return;
  }

  const coupon = await prisma.coupon.findFirst({
    where: { code: String(code).toUpperCase().trim(), tenantId },
  });
  if (!coupon || !coupon.active) {
    res.status(404).json({ error: 'Cupón no encontrado o inactivo' });
    return;
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    res.status(400).json({ error: 'Cupón expirado' });
    return;
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ error: 'Cupón agotado' });
    return;
  }

  const total = Number(cartTotal) || 0;
  if (total < coupon.minPurchase) {
    res.status(400).json({ error: `Compra mínima: $${coupon.minPurchase}` });
    return;
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((total * coupon.value) / 100);
  } else {
    discount = Math.min(coupon.value, total);
  }

  res.json({ coupon, discount });
};
