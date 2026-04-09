import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import { SOCIAL_ICON_MAP } from './SocialIcons';

export default function Footer() {
  const { config } = useSiteConfig();

  const socialEntries = config?.socialLinks && typeof config.socialLinks === 'object'
    ? Object.entries(config.socialLinks).filter(([, v]) => String(v).trim())
    : [];

  const footerDesc = (config as any)?.footerDescription || 'Tu tienda de confianza con los mejores productos de tecnología y accesorios.';

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          {config?.logo ? (
            <img src={assetUrl(config.logo)} alt={config.siteName || 'Logo'} className="h-10 mb-4 brightness-0 invert object-contain" />
          ) : (
            <h3 className="text-white text-lg font-bold mb-4">{config?.siteName}</h3>
          )}
          <p className="text-sm leading-relaxed">{footerDesc}</p>
          {socialEntries.length > 0 && (
            <div className="flex gap-3 mt-4">
              {socialEntries.map(([key, val]) => {
                const url = String(val);
                const SIcon = SOCIAL_ICON_MAP[key.toLowerCase()];
                if (!SIcon) return null;
                return (
                  <a key={key} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-primary p-2 rounded-full transition-colors" title={key}>
                    <SIcon size={16} className="text-gray-300" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-4">Navegación</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link to="/tienda" className="hover:text-white transition-colors">Tienda</Link></li>
            <li><Link to="/servicio-tecnico" className="hover:text-white transition-colors">Servicio técnico</Link></li>
            <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-4">Información</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/quienes-somos" className="hover:text-white transition-colors">¿Quiénes somos?</Link></li>
            <li><Link to="/preguntas-frecuentes" className="hover:text-white transition-colors">Preguntas frecuentes</Link></li>
            <li><Link to="/servicio-tecnico" className="hover:text-white transition-colors">Reparaciones</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-4">Contacto</h3>
          <ul className="space-y-3 text-sm">
            {config?.phone && (
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-primary" />
                <a href={`tel:${config.phone}`} className="hover:text-white transition-colors">{config.phone}</a>
              </li>
            )}
            {config?.email && (
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-primary" />
                <a href={`mailto:${config.email}`} className="hover:text-white transition-colors">{config.email}</a>
              </li>
            )}
            {config?.address && (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5 text-primary" /> {config.address}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} {config?.siteName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
