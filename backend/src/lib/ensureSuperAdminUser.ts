import { prisma } from './prisma';
import { hashPassword } from '../utils/password';

/** Crea o actualiza el usuario super admin según SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD. */
export async function ensureSuperAdminUser(): Promise<void> {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@webgenerica.com';
  const superAdminPasswordHash = await hashPassword(process.env.SUPER_ADMIN_PASSWORD || 'superadmin123');

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      password: superAdminPasswordHash,
      name: 'Super Administrador',
      role: 'super_admin',
      tenantId: null,
      isActive: true,
      suspendedAt: null,
      suspendReason: null,
      activatedAt: new Date(),
    },
    create: {
      email: superAdminEmail,
      password: superAdminPasswordHash,
      name: 'Super Administrador',
      role: 'super_admin',
      tenantId: null,
      isActive: true,
      activatedAt: new Date(),
    },
  });
}
