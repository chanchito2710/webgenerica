import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const sections: { id: string; title: string }[] = [
  { id: 'dashboard', title: 'Dashboard' },
  { id: 'inicio', title: 'Editar Inicio' },
  { id: 'servicio', title: 'Editar Servicio' },
  { id: 'faq', title: 'Editar FAQ' },
  { id: 'nosotros', title: 'Editar Nosotros' },
  { id: 'contacto', title: 'Editar Contacto' },
  { id: 'productos', title: 'Productos' },
  { id: 'categorias', title: 'Categorías' },
  { id: 'cupones', title: 'Cupones' },
  { id: 'pedidos', title: 'Pedidos' },
  { id: 'configuracion', title: 'Configuración' },
  { id: 'consejos', title: 'Consejos útiles' },
];

function Block({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section id={id} className="bg-white border rounded-lg p-5 md:p-6 scroll-mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
      <div className="text-sm text-gray-600 space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}

export default function AdminHelp() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Ayuda del panel</h1>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        Este es el panel de administración de tu tienda online. Desde acá podés actualizar textos, imágenes, productos y
        pedidos. Los cambios que guardes se reflejan en el sitio público de tu negocio (esta tienda).
      </p>

      <nav className="bg-white border rounded-lg p-4 mb-8" aria-label="Índice de ayuda">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">En esta página</p>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primary hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-4">
        <Block id="dashboard" title="Dashboard">
          <p>
            Es la pantalla de entrada del panel. Muestra un resumen con cantidad de productos, pedidos e ingresos
            aproximados. Sirve para orientarte de un vistazo; <strong>no editás contenido de la tienda</strong> desde
            acá. Para cambiar textos o productos, usá las secciones del menú lateral.
          </p>
        </Block>

        <Block id="inicio" title="Editar Inicio">
          <p>
            Acá armás la página principal: banners (slides) del hero, textos y botones, tarjetas de beneficios, bloque de
            Instagram y el banner promocional. Podés subir imágenes de fondo para escritorio y para celular, reordenar
            slides y ajustar estilos donde la pantalla lo permita.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>En cada zona de subida de imágenes verás recomendaciones de tamaño, formato y peso máximo.</li>
            <li>Guardá los cambios con el botón correspondiente al final de la página cuando esté disponible.</li>
          </ul>
        </Block>

        <Block id="servicio" title="Editar Servicio">
          <p>
            Editás la página &quot;Servicio técnico&quot;: títulos, descripciones, tarjetas de servicios y beneficios, y
            el bloque de llamada a la acción (CTA) de WhatsApp.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Banner principal:</strong> podés subir una imagen de fondo para escritorio y otra para celular, y personalizar colores de fondo, texto, títulos y fuentes desde el panel de estilos.</li>
            <li><strong>Tarjetas de servicios y beneficios:</strong> agregá, editá o eliminá tarjetas. Cada una permite elegir un ícono predefinido o subir uno propio, y opcionalmente agregar una imagen. Reordenalas arrastrando el ícono de las tres líneas (grip).</li>
            <li><strong>CTA WhatsApp:</strong> personalizá título, subtítulo, mensaje predeterminado y estilos visuales (colores, fondo).</li>
          </ul>
        </Block>

        <Block id="faq" title="Editar FAQ">
          <p>
            Gestionás las preguntas frecuentes que ven tus clientes.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Encabezado:</strong> editá título, subtítulo y personalizá el estilo del hero (colores, fuentes, imagen de fondo) desde el panel de estilos de sección.</li>
            <li><strong>Preguntas:</strong> agregá, editá o eliminá. Cada pregunta puede tener opcionalmente una imagen que se muestra al expandir la respuesta. Reordenalas arrastrando el ícono grip.</li>
          </ul>
        </Block>

        <Block id="nosotros" title="Editar Nosotros">
          <p>
            Personalizás la sección &quot;Quiénes somos&quot; de tu tienda.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Contenido:</strong> título, subtítulo y descripción de tu negocio.</li>
            <li><strong>Imágenes:</strong> podés subir una imagen principal para escritorio y otra versión para celular.</li>
            <li><strong>Puntos destacados:</strong> agregá frases cortas que resalten lo mejor de tu negocio. Reordenalos arrastrando el ícono grip.</li>
            <li><strong>Estilo del encabezado:</strong> personalizá colores, fuentes e imagen de fondo del hero desde el panel de estilos.</li>
          </ul>
        </Block>

        <Block id="contacto" title="Editar Contacto">
          <p>
            Definís la información de contacto que ven tus clientes.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Teléfonos:</strong> agregá los que necesites y reordenalos con drag-and-drop.</li>
            <li><strong>Mapa y horarios:</strong> pegá la URL del iframe de Google Maps y escribí tus horarios de atención.</li>
            <li><strong>Imágenes:</strong> subí una imagen de sección para escritorio y otra para celular.</li>
            <li><strong>Estilo del encabezado:</strong> personalizá colores, fuentes e imagen de fondo desde el panel de estilos.</li>
          </ul>
        </Block>

        <Block id="productos" title="Productos">
          <p>
            Creás, editás y eliminás productos: nombre, descripción, precios, stock, categoría, si está destacado o
            activo, y <strong>fotos</strong>. La primera imagen suele ser la principal en la tienda; podés reordenar las
            miniaturas si la pantalla lo permite.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Usá el botón para crear un producto nuevo o el lápiz para editar uno existente.</li>
            <li>Las recomendaciones de imágenes aparecen junto al cargador de archivos.</li>
          </ul>
        </Block>

        <Block id="categorias" title="Categorías">
          <p>
            Organizás las categorías del catálogo. Las categorías ayudan a que los clientes encuentren productos en la tienda.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Cada categoría tiene un nombre y una imagen que podés <strong>subir directamente</strong> (no hace falta pegar URLs).</li>
            <li>En la tabla de categorías vas a ver una miniatura de la imagen junto al nombre.</li>
            <li>Podés editar o eliminar categorías existentes desde los botones de acción.</li>
          </ul>
        </Block>

        <Block id="cupones" title="Cupones">
          <p>
            Creás y administrás códigos de descuento: montos o porcentajes, vigencia y condiciones que defina el sistema.
            Podés desactivar cupones que ya no quieras ofrecer. Revisá bien los valores antes de guardar.
          </p>
        </Block>

        <Block id="pedidos" title="Pedidos">
          <p>
            Ves los pedidos de tu tienda: estado, totales y detalle de lo que compró el cliente. Desde acá podés hacer
            seguimiento y actualizar el flujo según cómo trabajes (por ejemplo, marcar como enviado si aplica).
          </p>
        </Block>

        <Block id="configuracion" title="Configuración">
          <p>
            Ajustás datos generales del sitio: nombre, teléfono, email, dirección, moneda, <strong>logo</strong>,
            redes sociales y opciones de envío.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Logo:</strong> se muestra en el encabezado de la tienda. Subí una imagen clara y liviana.</li>
            <li><strong>Colores del tema:</strong> elegí un color primario y uno de acento. Se aplican automáticamente en toda la tienda (botones, enlaces, fondos, etc.).</li>
            <li><strong>Tipografía global:</strong> seleccioná una fuente para títulos y otra para textos de cuerpo entre las fuentes populares de Google Fonts. Debajo de cada selector vas a ver una vista previa de cómo se ve la fuente elegida.</li>
          </ul>
          <p className="mt-2">
            Cada bloque tiene sus propios campos: completá lo necesario y guardá para aplicar los cambios en toda la tienda.
          </p>
        </Block>

        <Block id="consejos" title="Consejos útiles">
          <ul className="list-disc pl-5 space-y-1">
            <li>Después de editar una pantalla, usá el botón <strong>Guardar</strong> para aplicar los cambios.</li>
            <li>
              Abrí la tienda en otra pestaña del navegador para verificar cómo quedó lo que publicaste (por ejemplo, la
              página de inicio o un producto).
            </li>
            <li>Si algo no sube, revisá el mensaje de error: a veces el archivo supera el peso máximo de 5 MB.</li>
            <li>
              <strong>Drag-and-drop:</strong> para reordenar elementos (slides, preguntas, beneficios, teléfonos, etc.),
              mantené presionado el ícono de las tres líneas (⠿) y arrastrá al lugar deseado.
            </li>
            <li>
              <strong>Estilos de sección:</strong> muchas secciones tienen un panel donde podés personalizar colores de fondo,
              colores de texto, fuentes e imágenes de fondo (escritorio y celular).
            </li>
            <li>
              <strong>Tema global:</strong> los colores y fuentes que elegís en{' '}
              <Link to="/admin/configuracion" className="text-primary hover:underline">Configuración</Link>{' '}
              se aplican a toda la tienda automáticamente. Los estilos por sección tienen prioridad sobre el tema global.
            </li>
            <li>
              Volvé a esta ayuda cuando quieras: menú lateral →{' '}
              <Link to="/admin/ayuda" className="text-primary hover:underline">
                Ayuda
              </Link>
              .
            </li>
          </ul>
        </Block>
      </div>
    </div>
  );
}
