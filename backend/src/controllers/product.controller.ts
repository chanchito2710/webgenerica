import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { slugify } from '../utils/slug';

const productIncludes = {
  category: true,
  images: { orderBy: { order: 'asc' as const } },
  variants: true,
};

export async function getProducts(req: Request, res: Response) {
  try {
    const { category, featured, search, sort, page = '1', limit = '12' } = req.query;
    const where: any = { active: true };

    if (category) where.category = { slug: String(category) };
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const sortKey = sort ? String(sort) : '';
    const orderBy =
      sortKey === 'newest'
        ? ({ createdAt: 'desc' } as const)
        : sortKey === 'price_asc'
          ? ({ price: 'asc' } as const)
          : sortKey === 'price_desc'
            ? ({ price: 'desc' } as const)
            : sortKey === 'name'
              ? ({ name: 'asc' } as const)
              : ({ createdAt: 'desc' } as const);

    const pageNum = Math.max(1, Number(page));
    const take = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: productIncludes, skip, take, orderBy }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: String(req.params.slug) },
      include: productIncludes,
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(String(req.params.id)) },
      include: productIncludes,
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
}

export async function getAllProducts(req: Request, res: Response) {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, Number(page));
    const take = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({ include: productIncludes, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.product.count(),
    ]);

    res.json({ products, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, salePrice, stock, featured, active, categoryId, images, variants } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }

    const slug = slugify(name);
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price,
        salePrice: salePrice || null,
        stock: stock || 0,
        featured: featured || false,
        active: active !== false,
        categoryId,
        images: images?.length ? { create: images.map((img: any, i: number) => ({ url: img.url, order: i })) } : undefined,
        variants: variants?.length ? { create: variants.map((v: any) => ({ name: v.name, value: v.value, priceAdjust: v.priceAdjust || 0, stock: v.stock || 0 })) } : undefined,
      },
      include: productIncludes,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, price, salePrice, stock, featured, active, categoryId, images, variants } = req.body;
    const data: any = {};

    if (name) { data.name = name; data.slug = slugify(name); }
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = price;
    if (salePrice !== undefined) data.salePrice = salePrice;
    if (stock !== undefined) data.stock = stock;
    if (featured !== undefined) data.featured = featured;
    if (active !== undefined) data.active = active;
    if (categoryId !== undefined) data.categoryId = categoryId;

    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: Number(id) } });
      data.images = { create: images.map((img: any, i: number) => ({ url: img.url, order: i })) };
    }
    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: Number(id) } });
      data.variants = { create: variants.map((v: any) => ({ name: v.name, value: v.value, priceAdjust: v.priceAdjust || 0, stock: v.stock || 0 })) };
    }

    const product = await prisma.product.update({ where: { id: Number(id) }, data, include: productIncludes });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
}
