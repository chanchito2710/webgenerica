import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { slugify } from '../utils/slug';

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true, _count: { select: { products: true } } },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
}

export async function getAllCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
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
    const { name, image, parentId } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre es requerido' });

    const slug = slugify(name);
    const category = await prisma.category.create({
      data: { name, slug, image: image || '', parentId: parentId || null },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, image, parentId } = req.body;
    const data: any = {};
    if (name) { data.name = name; data.slug = slugify(name); }
    if (image !== undefined) data.image = image;
    if (parentId !== undefined) data.parentId = parentId;

    const category = await prisma.category.update({ where: { id: Number(id) }, data });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: Number(id) } });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
}
