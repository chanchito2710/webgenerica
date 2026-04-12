# WebGenerica - Instructivo de uso

## Que es WebGenerica

WebGenerica es una plataforma e-commerce multi-tenant lista para usar. Funciona como una tienda online completa que se puede personalizar para cualquier tipo de negocio **sin tocar codigo**. Todo se configura desde el panel de administracion.

La tienda incluye: catalogo de productos, carrito de compras, checkout con opciones de envio, sistema de cupones, paginas informativas (FAQ, Contacto, Quienes Somos, Servicio Tecnico), panel admin completo con personalizacion visual, sistema multi-tenant con panel de Super Admin, y modo guia interactivo.

---

## Accesos

| Que | URL |
|-----|-----|
| Tienda (produccion) | https://webgenerica.vercel.app |
| Panel Admin | https://webgenerica.vercel.app/login |
| Super Admin | https://webgenerica.vercel.app/super-admin |
| API Backend | https://webgenerica-api.onrender.com |
| Repositorio | https://github.com/chanchito2710/webgenerica |

**Credenciales de administrador:**
- Email: `admin@webgenerica.com`
- Contraseña: `admin123`

**Credenciales de cliente de prueba:**
- Email: `cliente@test.com`
- Contraseña: `cliente123`

---

## Paginas publicas (lo que ve el cliente)

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| Inicio | `/` | Hero con carrusel, beneficios, categorias, productos destacados, ofertas, banner promo, seccion Instagram |
| Tienda | `/tienda` | Catalogo con filtros por categoria, busqueda, ordenamiento |
| Detalle de producto | `/producto/nombre-del-producto` | Fotos, precio, variantes, agregar al carrito |
| Carrito | `/carrito` | Items, cantidades, opciones de envio, resumen |
| Checkout | `/checkout` | Formulario de datos, direccion, metodo de pago |
| Confirmacion | `/orden-confirmada` | Resumen de la orden completada |
| Servicio Tecnico | `/servicio-tecnico` | Info del servicio con estilos personalizables, CTA de WhatsApp |
| Preguntas Frecuentes | `/preguntas-frecuentes` | Acordeon de preguntas/respuestas con imagenes opcionales |
| Contacto | `/contacto` | Telefonos, mapa Google Maps, horarios, con hero personalizable |
| Quienes Somos | `/quienes-somos` | Historia, imagen desktop/mobile, puntos destacados, hero personalizable |
| Login / Registro | `/login`, `/registro` | Acceso y creacion de cuenta |
| Mis Pedidos | `/mis-pedidos` | Historial de compras del usuario |

Las paginas informativas (Servicio Tecnico, FAQ, Contacto, Quienes Somos) aplican los estilos de seccion configurados por el admin (colores, fuentes, imagenes de fondo).

---

## Panel de Administracion

Se accede desde el boton "Administrador" en el header (visible solo si estas logueado como admin). El panel tiene las siguientes secciones:

### Modo Guia

Todas las paginas del admin incluyen un boton **"Modo guia"** en la parte superior. Al activarlo:
- Aparecen chips con las secciones disponibles en esa pagina.
- Al seleccionar una seccion, se resalta el bloque correspondiente y se atenuan los demas.
- Se muestra una descripcion breve de que es y que se puede hacer en esa seccion.
- Util para administradores que recien empiezan a usar el panel.

### Dashboard (`/admin`)

Resumen rapido con 3 tarjetas:
- Total de productos
- Total de pedidos
- Ingresos totales

### Editar Inicio (`/admin/inicio`)

Controla todo lo que se ve en la pagina principal:

**Carrusel Hero:**
- Agregar multiples slides (reordenables arrastrando)
- Dos tipos de slide: "Generico" (imagen de fondo) o "Producto destacado" (producto con fondo opcional)
- Imagen de escritorio y de celular (separadas para mejor responsividad)
- Titulo, subtitulo, texto adicional
- Tipografia: fuente Google, tamaño, peso, color (para titulo, subtitulo y botones)
- Layout: centrado, izquierda, derecha, esquinas
- Overlay: color y opacidad sobre la imagen
- Botones: texto, URL, estilo (relleno/borde), colores personalizables, reordenables

**Beneficios:**
- Tarjetas debajo del hero (ej: "Envio a todo el pais", "Todos los medios de pago")
- Icono predefinido o imagen personalizada
- Titulo y descripcion

**Seccion Instagram:**
- Titulo, URL del perfil, nombre de usuario
- Se muestra como un bloque con boton "Seguir"

**Banner Promocional:**
- Imagen, titulo, subtitulo
- URL y texto del enlace
- Se muestra como un banner ancho con gradiente

### Editar Servicio Tecnico (`/admin/servicio`)

- **Banner principal**: titulo, subtitulo, imagenes de fondo (escritorio + celular), estilos de seccion (colores de fondo/texto, fuentes)
- **Descripcion**: titulo de seccion + cuerpo de texto
- **Tarjetas de servicios**: icono predefinido o personalizado (subir imagen), imagen opcional por tarjeta, drag-and-drop para reordenar
- **Tarjetas de beneficios**: misma estructura que servicios, con drag-and-drop
- **CTA WhatsApp**: titulo, subtitulo, mensaje predeterminado, estilos personalizables (el numero viene de la config general)

### Editar FAQ (`/admin/faq`)

- **Encabezado**: titulo, subtitulo, estilos personalizables (colores, fuentes, imagen de fondo)
- **Preguntas**: agregar, editar y eliminar. Cada pregunta puede tener una imagen opcional. Reordenar con drag-and-drop

### Editar Quienes Somos (`/admin/nosotros`)

- **Contenido**: titulo, subtitulo, descripcion del negocio
- **Imagenes**: imagen principal para escritorio + version para celular
- **Puntos destacados**: frases cortas reordenables con drag-and-drop
- **Estilo del encabezado**: colores, fuentes e imagen de fondo del hero

### Editar Contacto (`/admin/contacto`)

- **Telefonos**: lista reordenable con drag-and-drop
- **Mapa y horarios**: URL de Google Maps embebido (con vista previa) + horarios de atencion
- **Imagenes**: imagen de seccion para escritorio y celular
- **Estilo del encabezado**: colores, fuentes e imagen de fondo

### Productos (`/admin/productos`)

- Crear, editar y eliminar productos
- Campos: nombre, descripcion, precio, precio oferta, stock, categoria, destacado, activo
- Subir multiples fotos (JPG/PNG/WebP/GIF, max 5MB, recomendado 800x800)
- Validacion de peso del archivo antes de subir (avisa si supera 5 MB)
- Reordenar fotos (la primera es la principal)
- El slug se genera automaticamente del nombre

### Categorias (`/admin/categorias`)

- Crear, editar y eliminar categorias
- Campos: nombre e imagen (subida directa, no URL)
- La tabla muestra una miniatura de la imagen junto al nombre
- El slug se genera automaticamente
- No se puede borrar una categoria si tiene productos asociados

### Pedidos (`/admin/pedidos`)

- Lista de todos los pedidos con datos del cliente, fecha, total y estado
- Vista expandida: items con cantidades y precios, direccion de envio, metodo de pago
- Cambiar estado: Pendiente, Procesando, Enviado, Entregado, Cancelado

### Cupones (`/admin/cupones`)

- Crear codigos de descuento
- Tipo: porcentaje o monto fijo
- Compra minima, usos maximos (0 = ilimitado), fecha de expiracion
- Activar/desactivar rapidamente desde la lista

### Configuracion General (`/admin/configuracion`)

- **Nombre del sitio** (aparece en header, footer, titulo del navegador)
- **Logo** (subir imagen, se muestra en header y footer)
- **Datos de contacto**: telefono, email, direccion
- **Moneda**: simbolo (ej: `$`, `US$`, `€`)
- **Redes sociales**: URLs de Instagram, Facebook, Twitter/X, TikTok
- **Colores del tema**: color primario y color de acento. Se aplican automaticamente en toda la tienda (botones, enlaces, fondos, etc.)
- **Tipografia global**: fuente para titulos y fuente para cuerpo de texto, seleccionables entre fuentes populares de Google Fonts, con vista previa en vivo
- **Descripcion del footer**: texto que aparece debajo del logo en el pie de pagina
- **Opciones de envio**: lista con nombre, costo y descripcion (aparecen en el carrito y checkout)

### Ayuda (`/admin/ayuda`)

Seccion de referencia con explicacion detallada de cada seccion del panel, que se puede hacer y como hacerlo. Incluye consejos sobre drag-and-drop, estilos de seccion y tema global.

---

## Sistema de tema global

El administrador puede personalizar la identidad visual de toda la tienda desde Configuracion:

- **Colores**: primario y acento. Se inyectan como CSS custom properties y se aplican en tiempo real a toda la tienda (botones, enlaces, badges, fondos).
- **Fuentes**: titulo (h1-h6) y cuerpo (body). Se cargan desde Google Fonts y se aplican globalmente.
- **Estilos por seccion**: cada pagina informativa tiene un panel de estilos donde se pueden personalizar colores de fondo, texto, titulos, fuentes e imagenes de fondo (escritorio + celular). Los estilos por seccion tienen prioridad sobre el tema global.

---

## Componentes reutilizables del admin

El panel usa componentes compartidos para mantener consistencia:

- **ImageUploadZone**: zona de subida con preview, cambiar y quitar imagen
- **ColorPickerField**: selector de color con input hex y boton quitar
- **FontSelect**: selector de fuentes Google con preview en vivo
- **SectionStyleEditor**: editor completo de estilos de seccion (colores, fuentes, fondos)
- **DragList**: lista generica con drag-and-drop para reordenar cualquier tipo de item

---

## Super Admin (`/super-admin`)

Panel de gestion de la plataforma multi-tenant. Solo accesible con rol `super_admin`.

### Tiendas (`/super-admin/tenants`)
- Crear, editar, suspender, reactivar y eliminar tiendas
- Cada tienda tiene: nombre, slug, dominio personalizado, plan y estado
- Ver cantidad de productos, pedidos y admins por tienda
- Acceso a pedidos y clientes de cada tienda

### Admins (`/super-admin/admins`)
- Crear y gestionar administradores asignados a tiendas

### Auditoria (`/super-admin/audit`)
- Log de acciones administrativas

### Dominios personalizados
- Cada tienda puede tener un dominio propio (ej: `prueba.juanitaaccesorios.com`)
- El backend resuelve automaticamente el tenant por dominio
- Los dominios se configuran desde el panel de Super Admin y deben apuntar a Vercel via DNS

---

## Como personalizar la tienda para un cliente nuevo

1. **Entrar al admin** con las credenciales de administrador
2. **Configuracion General**: cambiar nombre, logo, colores, fuentes, contacto, redes, moneda
3. **Editar Inicio**: armar el carrusel hero con las imagenes del negocio, ajustar beneficios
4. **Categorias**: crear las categorias del negocio (con imagenes)
5. **Productos**: cargar productos con fotos, precios y descripcion
6. **Paginas informativas**: editar FAQ, Contacto (mapa, telefonos), Quienes Somos, Servicio Tecnico. Cada una permite personalizar estilos del hero (colores, fuentes, fondo)
7. **Opciones de envio**: configurar en la seccion de Configuracion
8. **Cupones**: crear codigos de descuento si se necesitan

Con estos pasos, la tienda queda completamente adaptada al nuevo cliente sin tocar codigo.

---

## Limitaciones actuales y soluciones a futuro

### 1. Imagenes se pierden al re-deployar el backend
**Problema:** Las imagenes subidas se guardan en disco del servidor (Render Free). Cada vez que hay un nuevo deploy, el disco se resetea y las imagenes se pierden.
**Solucion:** Migrar el almacenamiento a **Cloudinary** (tier gratis con 25GB) o **Amazon S3**. Esto requiere cambiar el middleware de upload en el backend para subir a la nube en vez de al disco local.

### 2. Variantes de producto limitadas
**Problema:** El modelo de datos soporta variantes (talle, color, etc.) pero el formulario de admin no permite crearlas ni editarlas.
**Solucion:** Agregar seccion de variantes al formulario de productos en `AdminProducts.tsx`.

### 3. Sin gestion de pagos real
**Problema:** El checkout no procesa pagos reales. Solo registra la orden con metodo de pago seleccionado.
**Solucion:** Integrar **MercadoPago** (ideal para Uruguay/Latam) o **Stripe** como pasarela de pagos.

### 4. Sin notificaciones por email
**Problema:** El backend tiene el servicio de email configurado (nodemailer) pero no envia emails transaccionales automaticos.
**Solucion:** Configurar SMTP y activar envio de emails en confirmacion de orden, cambio de estado, etc.

### 5. Backend se duerme (Render Free)
**Problema:** El backend en Render Free se apaga tras 15 minutos sin uso. La primera visita tarda ~30 segundos en cargar.
**Solucion:** Upgrade a Render Starter ($7/mes) para mantener el servicio siempre activo, o usar un servicio de "ping" externo como UptimeRobot.

### 6. Base de datos expira en 90 dias
**Problema:** PostgreSQL en Render Free expira a los 90 dias.
**Solucion:** Antes de que expire, migrar a **Supabase** (tier gratis permanente con 500MB), **Neon** (tier gratis), o upgrade en Render.

### 7. Limite de 100 productos/pedidos en listados admin
**Problema:** Los listados del admin cargan hasta 100 registros. Con mas datos, no se ven todos.
**Solucion:** Implementar paginacion en los listados del admin.

### 8. Sin sistema de roles granular
**Problema:** Solo hay dos roles: `admin` y `customer`. No hay roles intermedios (ej: vendedor, soporte).
**Solucion:** Agregar tabla de roles/permisos y middleware de autorizacion.

---

## Stack tecnico (referencia)

| Componente | Tecnologia |
|------------|------------|
| Frontend | React 19 + TypeScript + Vite 8 + Tailwind CSS 4 |
| Backend | Node.js + Express 5 + TypeScript + Prisma 7 |
| Base de datos | PostgreSQL 16 |
| Hosting Frontend | Vercel (gratis) |
| Hosting Backend | Render (gratis) |
| Repositorio | GitHub |

---

## Flujo de deploy

```
Codigo local → git push → GitHub → Vercel (frontend) + Render (backend)
```

Cada push a la rama `master` dispara deploy automatico en ambas plataformas. No hay que hacer nada manual.
