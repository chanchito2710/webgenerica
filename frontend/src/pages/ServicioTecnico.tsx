import {
  Wrench, Smartphone, Tablet, Monitor, MessageCircle,
  CheckCircle, Clock, Shield, Cpu, HardDrive, Wifi,
  Battery, Camera, Headphones, Zap, Star, Heart, Truck, type LucideIcon,
} from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import SEO from '../components/SEO';
import { sectionBgStyle, sectionHeadingStyle } from '../utils/sectionStyle';
import type { ServicePageConfig } from '../types';

const iconMap: Record<string, LucideIcon> = {
  wrench: Wrench,
  smartphone: Smartphone,
  tablet: Tablet,
  monitor: Monitor,
  'check-circle': CheckCircle,
  clock: Clock,
  shield: Shield,
  cpu: Cpu,
  'hard-drive': HardDrive,
  wifi: Wifi,
  battery: Battery,
  camera: Camera,
  headphones: Headphones,
  zap: Zap,
  star: Star,
  heart: Heart,
  truck: Truck,
  tool: Wrench,
};

const fallback: ServicePageConfig = {
  heroTitle: 'Servicio Técnico',
  heroSubtitle: 'Nos especializamos en la reparación integral de teléfonos móviles, tablets y dispositivos electrónicos. Servicio profesional, eficiente y con garantía.',
  descTitle: 'Servicio de reparación',
  descBody: 'Nuestro objetivo es ofrecer un servicio técnico de alta calidad, profesional y eficiente, asegurando la plena satisfacción del cliente y la recuperación total de sus equipos en el menor tiempo posible.',
  servicesTitle: '¿Qué reparamos?',
  services: [
    { icon: 'smartphone', title: 'Celulares', desc: 'Reparación de pantallas, baterías, puertos de carga, botones, cámaras y más.' },
    { icon: 'tablet', title: 'Tablets', desc: 'Cambio de pantalla, batería, conectores y reparación de software.' },
    { icon: 'monitor', title: 'Dispositivos electrónicos', desc: 'Diagnóstico y reparación de notebooks, smartwatches y accesorios.' },
  ],
  benefitsTitle: '¿Por qué elegirnos?',
  benefits: [
    { icon: 'check-circle', title: 'Repuestos de calidad', desc: 'Trabajamos con repuestos originales o de excelente calidad.' },
    { icon: 'clock', title: 'Rapidez', desc: 'Recuperación de tus equipos en el menor tiempo posible.' },
    { icon: 'shield', title: 'Garantía', desc: 'Todos nuestros trabajos cuentan con garantía de servicio.' },
    { icon: 'wrench', title: 'Técnicos capacitados', desc: 'Equipo con experiencia comprobada en el rubro.' },
  ],
  ctaTitle: '¿Tu celular necesita atención?',
  ctaSubtitle: 'Escribinos ahora por WhatsApp y te asesoramos sin compromiso.',
  ctaWhatsappMessage: 'Hola, necesito reparar mi dispositivo.',
};

export default function ServicioTecnico() {
  const { config } = useSiteConfig();
  const st = config?.servicioTecnico?.heroTitle ? config.servicioTecnico : fallback;

  const whatsappNumber = config?.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(st.ctaWhatsappMessage)}`;

  return (
    <div>
      <SEO title="Servicio Técnico" />
      {/* Hero */}
      <section
        className="bg-gradient-to-r from-primary to-primary-dark text-white bg-cover bg-center"
        style={sectionBgStyle(st.heroStyles)}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <Wrench size={48} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={sectionHeadingStyle(st.heroStyles)}>{st.heroTitle}</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">{st.heroSubtitle}</p>
        </div>
      </section>

      {/* Description */}
      {st.descBody && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white border rounded-xl p-8 -mt-12 relative z-10 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{st.descTitle}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{st.descBody}</p>
          </div>
        </section>
      )}

      {/* Services */}
      {st.services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{st.servicesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {st.services.map((s, i) => {
              const Icon = iconMap[s.icon] || Wrench;
              return (
                <div key={i} className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  {s.image ? (
                    <img src={assetUrl(s.image)} alt={s.title} className="w-16 h-16 mx-auto rounded-full object-cover mb-4" />
                  ) : s.icon === 'custom' && s.customIcon ? (
                    <img src={assetUrl(s.customIcon)} alt={s.title} className="w-16 h-16 mx-auto rounded-full object-contain mb-4" />
                  ) : (
                    <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                      <Icon size={28} className="text-primary" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Benefits */}
      {st.benefits.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{st.benefitsTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {st.benefits.map((b, i) => {
                const Icon = iconMap[b.icon] || Wrench;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-full shrink-0">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{b.title}</h3>
                      <p className="text-sm text-gray-500">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA WhatsApp */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8" style={sectionBgStyle(st.ctaStyles)}>
          <MessageCircle size={40} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">{st.ctaTitle}</h2>
          <p className="text-gray-600 mb-6">{st.ctaSubtitle}</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            <MessageCircle size={20} />
            Escribir a WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
