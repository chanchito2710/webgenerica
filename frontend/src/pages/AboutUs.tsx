import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import SEO from '../components/SEO';

interface AboutPageConfig {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  highlights?: string[];
}

export default function AboutUs() {
  const { config } = useSiteConfig();
  const about: AboutPageConfig = (config as any)?.aboutPage || {};

  const title = about.title || '¿Quiénes Somos?';
  const description = about.description || 'Somos una tienda online apasionada por la tecnología, dedicada a ofrecerte los mejores productos con la mejor atención. Nuestro compromiso es brindarte una experiencia de compra excepcional.';
  const highlights = about.highlights || [
    'Productos de calidad con garantía',
    'Envíos a todo el país',
    'Atención personalizada',
    'Servicio técnico especializado',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SEO title="Quiénes Somos" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">{title}</h1>
      {about.subtitle && <p className="text-gray-500 text-center mb-8">{about.subtitle}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-8">
        <div>
          {about.image ? (
            <img src={assetUrl(about.image!)} alt={title} className="w-full rounded-2xl shadow-lg" />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
              <span className="text-6xl">🏪</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{description}</p>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">¿Qué nos diferencia?</h3>
          <ul className="space-y-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span className="text-gray-700 text-sm">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
