import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export async function register(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, tenantId, isActive: true },
    });

    const token = signToken({ userId: user.id, role: user.role, tenantId: user.tenantId });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Cuenta no activada. Revisá tu email.' });
    }

    if (user.suspendedAt) {
      return res.status(403).json({ error: 'Cuenta suspendida. Contactá al administrador.' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = signToken({ userId: user.id, role: user.role, tenantId: user.tenantId });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, tenantId: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
}

export async function activateAccount(req: Request, res: Response) {
  try {
    const token = String(req.params.token);
    const user = await prisma.user.findFirst({ where: { activationToken: token } });
    if (!user) {
      return res.status(404).json({ error: 'Token de activación inválido' });
    }
    if (user.isActive) {
      return res.json({ message: 'La cuenta ya está activa' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true, activationToken: null, activatedAt: new Date() },
    });

    res.json({ message: 'Cuenta activada exitosamente. Ya podés iniciar sesión.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al activar cuenta' });
  }
}
