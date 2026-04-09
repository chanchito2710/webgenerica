import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { slugify } from '../utils/slug';

export async function getCategories(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const categories = await prisma.category.findMany({
      include: { children: true, _count: { select: { products: true } } },
      where: { tenantId, parentId: null },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
}

export async function getAllCategories(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { name, image, parentId } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre es requerido' });

    const slug = slugify(name);
    const category = await prisma.category.create({
      data: { tenantId, name, slug, image: image || '', parentId: parentId || null },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const catId = Number(req.params.id);

    const existing = await prisma.category.findFirst({ where: { id: catId, tenantId } });
    if (!existing) return res.status(404).json({ error: 'Categoría no encontrada' });

    const { name, image, parentId } = req.body;
    const data: any = {};
    if (name) { data.name = name; data.slug = slugify(name); }
    if (image !== undefined) data.image = image;
    if (parentId !== undefined) data.parentId = parentId;

    const category = await prisma.category.update({ where: { id: catId }, data });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const catId = Number(req.params.id);

    const existing = await prisma.category.findFirst({ where: { id: catId, tenantId } });
    if (!existing) return res.status(404).json({ error: 'Categoría no encontrada' });

    await prisma.category.delete({ where: { id: catId } });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
}
