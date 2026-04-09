import { prisma } from './lib/prisma';
import { hashPassword } from './utils/password';

async function main() {
  console.log('Seeding database...');

  // Default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: { slug: 'default', name: 'Tienda Default', status: 'active', plan: 'free' },
  });
  const tenantId = tenant.id;

  // Site config
  await prisma.siteConfig.upsert({
    where: { tenantId },
    update: {},
    create: {
      tenantId,
      siteName: 'WebGenerica Store',
      phone: '+598 99 123 456',
      email: 'info@webgenerica.com',
      address: 'Av. Principal 1234, Ciudad, País',
      socialLinks: { instagram: '@webgenerica', facebook: 'webgenerica' },
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        accentColor: '#f59e0b',
      },
      currency: '$',
      heroBanner: [
        {
          imageUrl: '',
          title: 'Todo lo que buscás, en un solo lugar',
          subtitle: 'Expertos en tecnología. Los mejores productos con la mejor atención.',
          buttons: [
            { text: 'Ver Productos', url: '/tienda', style: 'primary' },
            { text: 'Servicio Técnico', url: '/servicio-tecnico', style: 'primary' },
            { text: 'Contacto', url: '/contacto', style: 'outline' },
          ],
        },
      ],
      benefits: [
        { icon: 'truck', title: 'Envío a todo el país', description: 'Recibí tu pedido donde estés' },
        { icon: 'credit-card', title: 'Todos los medios de pago', description: 'Tarjetas, transferencia y más' },
        { icon: 'wrench', title: 'Servicio técnico', description: 'Reparamos tu dispositivo' },
      ],
    },
  });

  // Super Admin user
  const superAdminPassword = await hashPassword(process.env.SUPER_ADMIN_PASSWORD || 'superadmin123');
  await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@webgenerica.com' },
    update: {},
    create: {
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@webgenerica.com',
      password: superAdminPassword,
      name: 'Super Administrador',
      role: 'super_admin',
      tenantId: null,
      isActive: true,
      activatedAt: new Date(),
    },
  });

  // Admin user for default tenant
  const adminPassword = await hashPassword('admin123');
  await prisma.user.upsert({
    where: { email: 'admin@webgenerica.com' },
    update: {},
    create: {
      email: 'admin@webgenerica.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin',
      tenantId,
      isActive: true,
      activatedAt: new Date(),
    },
  });

  // Demo customer
  const customerPassword = await hashPassword('cliente123');
  await prisma.user.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      email: 'cliente@test.com',
      password: customerPassword,
      name: 'Cliente Demo',
      role: 'customer',
      tenantId,
      isActive: true,
    },
  });

  // Categories
  const categories = [
    { name: 'Auriculares', slug: 'auriculares', image: '' },
    { name: 'Cables y Cargadores', slug: 'cables-y-cargadores', image: '' },
    { name: 'Celulares y Tablet', slug: 'celulares-y-tablet', image: '' },
    { name: 'Informática', slug: 'informatica', image: '' },
    { name: 'Fundas y Protección', slug: 'fundas-y-proteccion', image: '' },
    { name: 'Parlantes', slug: 'parlantes', image: '' },
    { name: 'Relojes', slug: 'relojes', image: '' },
    { name: 'Para Vehículos', slug: 'para-vehiculos', image: '' },
    { name: 'Para el Hogar', slug: 'para-el-hogar', image: '' },
  ];

  const createdCategories: Record<string, number> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId, slug: cat.slug } },
      update: {},
      create: { ...cat, tenantId },
    });
    createdCategories[cat.slug] = created.id;
  }

  // Sample products
  const products = [
    { name: 'Auricular Bluetooth TWS R7M', slug: 'auricular-bluetooth-tws-r7m', description: 'Auricular Bluetooth V5.0 con tecnología táctil, calidad de sonido HIFI. Distancia de transmisión: 10m. Tiempo de música: 4-6hs. Puerto de carga: Tipo C.', price: 990, salePrice: 800, stock: 25, featured: true, categorySlug: 'auriculares' },
    { name: 'Cargador para auto 3 en 1 USAMS CC119', slug: 'cargador-auto-3-en-1-usams-cc119', description: 'Cargador de auto USB dual 3.4A con puerto Micro USB, Tipo C y Lightning.', price: 890, salePrice: 720, stock: 15, featured: true, categorySlug: 'cables-y-cargadores' },
    { name: 'Power Bank 10.000mAh ROCA PB10', slug: 'power-bank-10000mah-roca-pb10', description: 'Power Bank de 10.000mAh con pantalla LCD.', price: 1300, salePrice: 1100, stock: 20, featured: true, categorySlug: 'cables-y-cargadores' },
    { name: 'Combo GAMER Lizzard', slug: 'combo-gamer-lizzard', description: 'Combo completo: Mouse Gamer 4D, Teclado Gamer 105 teclas, Auricular con micrófono y Mouse Pad.', price: 2200, salePrice: 1800, stock: 10, featured: true, categorySlug: 'informatica' },
    { name: 'Adaptador USB-C a Micro USB', slug: 'adaptador-usb-c-a-micro-usb', description: 'Adaptador compacto USB-C a Micro USB.', price: 300, salePrice: null, stock: 50, featured: false, categorySlug: 'informatica' },
    { name: 'Adaptador HDMI Macho a Hembra', slug: 'adaptador-hdmi-macho-a-hembra', description: 'Convierte fácilmente un puerto HDMI hembra en una conexión HDMI macho.', price: 150, salePrice: null, stock: 40, featured: false, categorySlug: 'informatica' },
    { name: 'Cámara de Vigilancia Wi-Fi 360°', slug: 'camara-vigilancia-wifi-360', description: 'Cámara inteligente con movimiento 360°, detección de movimiento.', price: 2500, salePrice: null, stock: 15, featured: true, categorySlug: 'para-el-hogar' },
    { name: 'Tarjetero Magsafe de Cuero', slug: 'tarjetero-magsafe-cuero', description: 'Compatible con iPhone 12/13/14/15.', price: 2100, salePrice: 1900, stock: 12, featured: false, categorySlug: 'fundas-y-proteccion' },
    { name: 'Xiaomi Redmi A5 4GB 128GB', slug: 'xiaomi-redmi-a5-4gb-128gb', description: 'Pantalla IPS LCD 6.88" 120Hz, batería 5200mAh.', price: 9500, salePrice: null, stock: 8, featured: true, categorySlug: 'celulares-y-tablet' },
    { name: 'Samsung Galaxy A06 4GB 128GB', slug: 'samsung-galaxy-a06-4gb-128gb', description: 'Pantalla PLS LCD 6.7", procesador 8 núcleos.', price: 12300, salePrice: null, stock: 6, featured: false, categorySlug: 'celulares-y-tablet' },
    { name: 'Parlante Bluetooth Portátil JBL GO 3', slug: 'parlante-bluetooth-jbl-go-3', description: 'Parlante ultraportátil resistente al agua IP67.', price: 3200, salePrice: null, stock: 18, featured: true, categorySlug: 'parlantes' },
    { name: 'Smartwatch Deportivo Banda', slug: 'smartwatch-deportivo-banda', description: 'Reloj inteligente con monitor de ritmo cardíaco.', price: 1800, salePrice: 1500, stock: 22, featured: false, categorySlug: 'relojes' },
  ];

  for (const p of products) {
    const { categorySlug, ...productData } = p;
    await prisma.product.upsert({
      where: { tenantId_slug: { tenantId, slug: p.slug } },
      update: {},
      create: {
        ...productData,
        tenantId,
        categoryId: createdCategories[categorySlug],
      },
    });
  }

  console.log('Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
