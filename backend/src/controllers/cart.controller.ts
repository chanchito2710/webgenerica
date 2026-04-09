import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const cartIncludes = {
  product: { include: { images: { take: 1, orderBy: { order: 'asc' as const } } } },
  variant: true,
};

export async function getCart(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId, tenantId },
      include: cartIncludes,
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
}

export async function addToCart(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId es requerido' });

    const vId = variantId || null;
    const existing = vId
      ? await prisma.cartItem.findUnique({
          where: { userId_productId_variantId: { userId, productId, variantId: vId } },
        })
      : await prisma.cartItem.findFirst({
          where: { userId, productId, variantId: null, tenantId },
        });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: cartIncludes,
      });
    } else {
      item = await prisma.cartItem.create({
        data: { tenantId, userId, productId, variantId: vId, quantity },
        include: cartIncludes,
      });
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
}

export async function updateCartItem(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const itemId = Number(req.params.id);
    const { quantity } = req.body;

    const existing = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: req.user!.userId, tenantId },
    });
    if (!existing) return res.status(404).json({ error: 'Item no encontrado' });

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ message: 'Item eliminado del carrito' });
    }

    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: cartIncludes,
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar carrito' });
  }
}

export async function removeFromCart(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const itemId = Number(req.params.id);

    const existing = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: req.user!.userId, tenantId },
    });
    if (!existing) return res.status(404).json({ error: 'Item no encontrado' });

    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: 'Item eliminado del carrito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
}

export async function resolveGuestCart(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.json([]);
    }

    const productIds = [...new Set(items.map((i: any) => Number(i.productId)))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId, active: true },
      include: {
        images: { take: 1, orderBy: { order: 'asc' as const } },
        variants: true,
        category: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const resolved = items
      .map((item: any) => {
        const product = productMap.get(Number(item.productId));
        if (!product) return null;
        const variant = item.variantId
          ? product.variants.find((v) => v.id === Number(item.variantId)) || null
          : null;
        return {
          id: `${item.productId}-${item.variantId || 0}`,
          productId: product.id,
          variantId: variant?.id || null,
          quantity: Number(item.quantity) || 1,
          product,
          variant,
        };
      })
      .filter(Boolean);

    res.json(resolved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al resolver carrito' });
  }
}

export async function clearCart(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId, tenantId } });
    res.json({ message: 'Carrito vaciado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al vaciar carrito' });
  }
}
