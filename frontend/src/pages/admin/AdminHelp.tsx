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
            Editás el contenido de la página &quot;Servicio técnico&quot; que ven tus clientes: títulos, descripciones y
            datos de contacto o información del servicio. Completá los campos y guardá para publicar los cambios.
          </p>
        </Block>

        <Block id="faq" title="Editar FAQ">
          <p>
            Gestionás las preguntas frecuentes: podés agregar, editar o quitar ítems y ordenarlos. Cada entrada suele
            tener una pregunta y una respuesta. Guardá cuando termines para que se vean en la página pública de FAQ.
          </p>
        </Block>

        <Block id="nosotros" title="Editar Nosotros">
          <p>
            Personalizás la sección &quot;Quiénes somos&quot;: título, texto, imagen opcional y puntos destacados. Subí
            una imagen si querés reforzar la presentación de tu negocio y guardá los cambios.
          </p>
        </Block>

        <Block id="contacto" title="Editar Contacto">
          <p>
            Definís cómo se muestra la información de contacto en la página de contacto (textos, datos y lo que permita
            el formulario de edición). Revisá que teléfonos y correos sean correctos antes de guardar.
          </p>
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
            Organizás las categorías del catálogo (nombre, imagen o enlace según lo que ofrezca el formulario). Las
            categorías ayudan a que los clientes encuentren productos en la tienda. Guardá después de cada cambio
            importante.
          </p>
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
            redes sociales, opciones de envío y colores del tema cuando estén disponibles. El logo suele mostrarse en el
            encabezado; subí una imagen clara y liviana.
          </p>
          <p className="mt-2">
            Cada bloque tiene sus propios campos: completá lo necesario y guardá para aplicar los cambios en toda la
            tienda.
          </p>
        </Block>

        <Block id="consejos" title="Consejos útiles">
          <ul className="list-disc pl-5 space-y-1">
            <li>Después de editar una pantalla, usá el botón Guardar (u equivalente) si aparece.</li>
            <li>
              Abrí la tienda en otra pestaña del navegador para verificar cómo quedó lo que publicaste (por ejemplo, la
              página de inicio o un producto).
            </li>
            <li>Si algo no sube, revisá el mensaje de error: a veces el archivo supera el peso máximo permitido.</li>
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
