export interface GuideSectionDef {
  id: string;
  label: string;
  description: string;
}

const adminGuideSections: Record<string, GuideSectionDef[]> = {
  '/admin/inicio': [
    { id: 'hero', label: 'Carrusel de Banners', description: 'Agregá y editá los slides del carrusel principal con imágenes, textos, botones y estilos.' },
    { id: 'benefits', label: 'Tarjetas de Beneficios', description: 'Mostrá íconos y textos cortos debajo del hero (ej: "Envío a todo el país").' },
    { id: 'instagram', label: 'Sección Instagram', description: 'Configurá el bloque de Instagram con tu usuario y URL del perfil.' },
    { id: 'promo', label: 'Banner Promocional', description: 'Armá un banner ancho con imagen, texto y enlace para destacar una promo.' },
  ],
  '/admin/servicio': [
    { id: 'hero', label: 'Banner Principal', description: 'Título, subtítulo, imágenes y estilos del encabezado.' },
    { id: 'desc', label: 'Descripción', description: 'Título y texto descriptivo del servicio técnico.' },
    { id: 'services', label: 'Servicios', description: 'Tarjetas de servicios que ofrecés, con íconos e imágenes.' },
    { id: 'benefits', label: 'Beneficios', description: 'Razones por las que elegirte.' },
    { id: 'cta', label: 'CTA WhatsApp', description: 'Bloque de llamada a la acción con enlace a WhatsApp.' },
  ],
  '/admin/faq': [
    { id: 'header', label: 'Encabezado', description: 'Título, subtítulo y estilos del hero.' },
    { id: 'items', label: 'Preguntas', description: 'Lista de preguntas y respuestas con drag-and-drop.' },
  ],
  '/admin/nosotros': [
    { id: 'content', label: 'Contenido', description: 'Título, subtítulo y descripción del negocio.' },
    { id: 'images', label: 'Imágenes', description: 'Imagen principal de escritorio y versión celular.' },
    { id: 'highlights', label: 'Puntos Destacados', description: 'Frases cortas reordenables que resaltan lo mejor.' },
    { id: 'hero-style', label: 'Estilo del Encabezado', description: 'Colores, fuentes e imagen de fondo del hero.' },
  ],
  '/admin/contacto': [
    { id: 'phones', label: 'Teléfonos', description: 'Lista de teléfonos reordenables.' },
    { id: 'map', label: 'Mapa y Horarios', description: 'Google Maps embebido y horarios de atención.' },
    { id: 'images', label: 'Imágenes', description: 'Imágenes de la sección para escritorio y celular.' },
    { id: 'hero-style', label: 'Estilo del Encabezado', description: 'Colores, fuentes e imagen de fondo.' },
  ],
  '/admin/configuracion': [
    { id: 'general', label: 'Datos Generales', description: 'Nombre, logo, moneda y datos de contacto.' },
    { id: 'social', label: 'Redes Sociales', description: 'URLs de Instagram, Facebook, Twitter/X, TikTok.' },
    { id: 'theme', label: 'Colores y Fuentes', description: 'Colores primario/acento y tipografía global.' },
    { id: 'footer', label: 'Pie de Página', description: 'Texto descriptivo del footer.' },
    { id: 'shipping', label: 'Opciones de Envío', description: 'Métodos de envío con nombre, costo y descripción.' },
  ],
};

export default adminGuideSections;
