import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const cartIncludes = {
  product: { include: { images: { take: 1, orderBy: { order: 'asc' as const } } } },
  variant: true,
};

export async function getCart(req: Request, res: Response) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
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
    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId es requerido' });

    const vId = variantId || null;
    const existing = vId
      ? await prisma.cartItem.findUnique({
          where: { userId_productId_variantId: { userId: req.user!.userId, productId, variantId: vId } },
        })
      : await prisma.cartItem.findFirst({
          where: { userId: req.user!.userId, productId, variantId: null },
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
        data: { userId: req.user!.userId, productId, variantId: vId, quantity },
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
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: Number(id) } });
      return res.json({ message: 'Item eliminado del carrito' });
    }

    const item = await prisma.cartItem.update({
      where: { id: Number(id) },
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
    const { id } = req.params;
    await prisma.cartItem.delete({ where: { id: Number(id) } });
    res.json({ message: 'Item eliminado del carrito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
}

export async function resolveGuestCart(req: Request, res: Response) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.json([]);
    }

    const productIds = [...new Set(items.map((i: any) => Number(i.productId)))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
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
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
    res.json({ message: 'Carrito vaciado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al vaciar carrito' });
  }
}
