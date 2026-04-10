/**
 * Solo crea/actualiza el super admin (producción sin correr el seed completo).
 * Uso: DATABASE_URL=... npx tsx src/seed-super-admin-only.ts
 * Opcional: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
 */
import { ensureSuperAdminUser } from './lib/ensureSuperAdminUser';
import { prisma } from './lib/prisma';

async function main() {
  await ensureSuperAdminUser();
  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@webgenerica.com';
  console.log(`Super admin OK: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
