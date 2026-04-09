import { prisma } from './lib/prisma';
import { hashPassword } from './utils/password';

async function main() {
  console.log('Seeding database...');

  // Site config
  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
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

  // Admin user
  const adminPassword = await hashPassword('admin123');
  await prisma.user.upsert({
    where: { email: 'admin@webgenerica.com' },
    update: {},
    create: {
      email: 'admin@webgenerica.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin',
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
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
  }

  // Sample products
  const products = [
    {
      name: 'Auricular Bluetooth TWS R7M',
      slug: 'auricular-bluetooth-tws-r7m',
      description: 'Auricular Bluetooth V5.0 con tecnología táctil, calidad de sonido HIFI. Distancia de transmisión: 10m. Tiempo de música: 4-6hs. Puerto de carga: Tipo C.',
      price: 990,
      salePrice: 800,
      stock: 25,
      featured: true,
      categorySlug: 'auriculares',
    },
    {
      name: 'Cargador para auto 3 en 1 USAMS CC119',
      slug: 'cargador-auto-3-en-1-usams-cc119',
      description: 'Cargador de auto USB dual 3.4A con puerto Micro USB, Tipo C y Lightning. Cable de resorte estirable, pantalla digital de voltaje.',
      price: 890,
      salePrice: 720,
      stock: 15,
      featured: true,
      categorySlug: 'cables-y-cargadores',
    },
    {
      name: 'Power Bank 10.000mAh ROCA PB10',
      slug: 'power-bank-10000mah-roca-pb10',
      description: 'Power Bank de 10.000mAh con pantalla LCD. Carga hasta dos dispositivos simultáneamente. Puertos: Micro USB, USB C entrada, USB estándar + USB C salida.',
      price: 1300,
      salePrice: 1100,
      stock: 20,
      featured: true,
      categorySlug: 'cables-y-cargadores',
    },
    {
      name: 'Combo GAMER Lizzard',
      slug: 'combo-gamer-lizzard',
      description: 'Combo completo: Mouse Gamer 4D con iluminación 7 colores, Teclado Gamer 105 teclas retroiluminado, Auricular con micrófono y Mouse Pad.',
      price: 2200,
      salePrice: 1800,
      stock: 10,
      featured: true,
      categorySlug: 'informatica',
    },
    {
      name: 'Adaptador USB-C a Micro USB',
      slug: 'adaptador-usb-c-a-micro-usb',
      description: 'Adaptador compacto que permite conectar cables Micro USB a dispositivos con puerto USB-C.',
      price: 300,
      salePrice: null,
      stock: 50,
      featured: false,
      categorySlug: 'informatica',
    },
    {
      name: 'Adaptador HDMI Macho a Hembra',
      slug: 'adaptador-hdmi-macho-a-hembra',
      description: 'Convierte fácilmente un puerto HDMI hembra en una conexión HDMI macho. Ideal como extensor.',
      price: 150,
      salePrice: null,
      stock: 40,
      featured: false,
      categorySlug: 'informatica',
    },
    {
      name: 'Cámara de Vigilancia Wi-Fi 360°',
      slug: 'camara-vigilancia-wifi-360',
      description: 'Cámara inteligente con movimiento 360°, detección de movimiento, alarma de luz y sonido, visión nocturna y audio bidireccional.',
      price: 2500,
      salePrice: null,
      stock: 15,
      featured: true,
      categorySlug: 'para-el-hogar',
    },
    {
      name: 'Tarjetero Magsafe de Cuero',
      slug: 'tarjetero-magsafe-cuero',
      description: 'Compatible con iPhone 12/13/14/15. Capacidad para 2 tarjetas + CI. Apertura con bisagra, ajustable como soporte horizontal y vertical.',
      price: 2100,
      salePrice: 1900,
      stock: 12,
      featured: false,
      categorySlug: 'fundas-y-proteccion',
    },
    {
      name: 'Xiaomi Redmi A5 4GB 128GB',
      slug: 'xiaomi-redmi-a5-4gb-128gb',
      description: 'Pantalla IPS LCD 6.88" 120Hz, Gorilla Glass 3, batería 5200mAh con cargador 33W, cámara 32MP, Android 15 GO, Dual SIM 4G.',
      price: 9500,
      salePrice: null,
      stock: 8,
      featured: true,
      categorySlug: 'celulares-y-tablet',
    },
    {
      name: 'Samsung Galaxy A06 4GB 128GB',
      slug: 'samsung-galaxy-a06-4gb-128gb',
      description: 'Pantalla PLS LCD 6.7", procesador 8 núcleos, cámara 50MP + 2MP, batería 5000mAh, Android 14. Compatible con Antel, Claro y Movistar.',
      price: 12300,
      salePrice: null,
      stock: 6,
      featured: false,
      categorySlug: 'celulares-y-tablet',
    },
    {
      name: 'Parlante Bluetooth Portátil JBL GO 3',
      slug: 'parlante-bluetooth-jbl-go-3',
      description: 'Parlante ultraportátil resistente al agua IP67. Batería de 5 horas. Conexión Bluetooth 5.1.',
      price: 3200,
      salePrice: null,
      stock: 18,
      featured: true,
      categorySlug: 'parlantes',
    },
    {
      name: 'Smartwatch Deportivo Banda',
      slug: 'smartwatch-deportivo-banda',
      description: 'Reloj inteligente con monitor de ritmo cardíaco, podómetro, notificaciones, resistente al agua. Batería de larga duración.',
      price: 1800,
      salePrice: 1500,
      stock: 22,
      featured: false,
      categorySlug: 'relojes',
    },
  ];

  for (const p of products) {
    const { categorySlug, ...productData } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
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
