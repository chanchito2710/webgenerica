# WebGenerica - Instructivo de uso

## Que es WebGenerica

WebGenerica es una plataforma e-commerce lista para usar. Funciona como una tienda online completa que se puede personalizar para cualquier tipo de negocio **sin tocar codigo**. Todo se configura desde el panel de administracion.

La tienda incluye: catalogo de productos, carrito de compras, checkout con opciones de envio, sistema de cupones, paginas informativas (FAQ, Contacto, Quienes Somos, Servicio Tecnico) y un panel admin completo.

---

## Accesos

| Que | URL |
|-----|-----|
| Tienda (produccion) | https://webgenerica.vercel.app |
| Panel Admin | https://webgenerica.vercel.app/login |
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
| Servicio Tecnico | `/servicio-tecnico` | Info del servicio, CTA de WhatsApp |
| Preguntas Frecuentes | `/preguntas-frecuentes` | Acordeon de preguntas/respuestas |
| Contacto | `/contacto` | Telefonos, mapa Google Maps, horarios |
| Quienes Somos | `/quienes-somos` | Historia, imagen, puntos destacados |
| Login / Registro | `/login`, `/registro` | Acceso y creacion de cuenta |
| Mis Pedidos | `/mis-pedidos` | Historial de compras del usuario |

---

## Panel de Administracion

Se accede desde el boton "Administrador" en el header (visible solo si estas logueado como admin). El panel tiene las siguientes secciones:

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

### Productos (`/admin/productos`)

- Crear, editar y eliminar productos
- Campos: nombre, descripcion, precio, precio oferta, stock, categoria, destacado, activo
- Subir multiples fotos (JPG/PNG/WebP, max 5MB, recomendado 800x800)
- Reordenar fotos (la primera es la principal)
- El slug se genera automaticamente del nombre

### Categorias (`/admin/categorias`)

- Crear, editar y eliminar categorias
- Campos: nombre e imagen (por URL)
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

### Editar FAQ (`/admin/faq`)

- Titulo y subtitulo de la pagina
- Lista de preguntas y respuestas
- Reordenar con flechas, agregar y eliminar

### Editar Contacto (`/admin/contacto`)

- Lista de telefonos de contacto
- URL de Google Maps embebido (con vista previa)
- Horarios de atencion (texto libre)

### Editar Quienes Somos (`/admin/nosotros`)

- Titulo, subtitulo, descripcion larga
- Imagen (subir archivo)
- Lista de puntos destacados

### Editar Servicio Tecnico (`/admin/servicio`)

- Hero: titulo y subtitulo
- Descripcion: titulo de seccion + cuerpo
- Tarjetas de servicios: icono (de lista predefinida), titulo, descripcion
- Tarjetas de beneficios: misma estructura
- CTA WhatsApp: titulo, subtitulo, mensaje predeterminado (el numero viene de la config general)

### Configuracion General (`/admin/configuracion`)

- **Nombre del sitio** (aparece en header, footer, titulo del navegador)
- **Logo** (subir imagen, se muestra en header y footer)
- **Datos de contacto**: telefono, email, direccion
- **Moneda**: simbolo (ej: `$`, `US$`, `€`)
- **Redes sociales**: URLs de Instagram, Facebook, Twitter/X, TikTok
- **Colores del tema**: color primario y color de acento (selector de color)
- **Descripcion del footer**: texto que aparece debajo del logo en el pie de pagina
- **Opciones de envio**: lista con nombre, costo y descripcion (aparecen en el carrito y checkout)

---

## Como personalizar la tienda para un cliente nuevo

1. **Entrar al admin** con `admin@webgenerica.com` / `admin123`
2. **Configuracion General**: cambiar nombre, logo, colores, contacto, redes, moneda
3. **Editar Inicio**: armar el carrusel hero con las imagenes del negocio, ajustar beneficios
4. **Categorias**: crear las categorias del negocio
5. **Productos**: cargar productos con fotos, precios y descripcion
6. **Paginas informativas**: editar FAQ, Contacto (mapa, telefonos), Quienes Somos, Servicio Tecnico
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

### 3. Imagenes de categorias por URL
**Problema:** Las categorias requieren pegar una URL de imagen en vez de subirla como en productos.
**Solucion:** Integrar el mismo componente de upload que usan los productos.

### 4. Sin gestion de pagos real
**Problema:** El checkout no procesa pagos reales. Solo registra la orden con metodo de pago seleccionado.
**Solucion:** Integrar **MercadoPago** (ideal para Uruguay/Latam) o **Stripe** como pasarela de pagos.

### 5. Sin notificaciones por email
**Problema:** El backend tiene el servicio de email configurado (nodemailer) pero no envia emails transaccionales automaticos.
**Solucion:** Configurar SMTP y activar envio de emails en confirmacion de orden, cambio de estado, etc.

### 6. Backend se duerme (Render Free)
**Problema:** El backend en Render Free se apaga tras 15 minutos sin uso. La primera visita tarda ~30 segundos en cargar.
**Solucion:** Upgrade a Render Starter ($7/mes) para mantener el servicio siempre activo, o usar un servicio de "ping" externo como UptimeRobot.

### 7. Base de datos expira en 90 dias
**Problema:** PostgreSQL en Render Free expira a los 90 dias.
**Solucion:** Antes de que expire, migrar a **Supabase** (tier gratis permanente con 500MB), **Neon** (tier gratis), o upgrade en Render.

### 8. Sin busqueda avanzada con imagenes
**Problema:** La busqueda funciona por texto pero los resultados del seed no tienen imagenes cargadas.
**Solucion:** Subir imagenes de productos desde el admin. La busqueda mostrara las miniaturas automaticamente.

### 9. Limite de 100 productos/pedidos en listados admin
**Problema:** Los listados del admin cargan hasta 100 registros. Con mas datos, no se ven todos.
**Solucion:** Implementar paginacion en los listados del admin.

### 10. Sin sistema de roles granular
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
