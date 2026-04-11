import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { configService } from '../services/config.service';
import { darken } from '../utils/color';
import { loadGoogleFont } from '../utils/fonts';
import type { SiteConfig } from '../types';

function applyThemeToDOM(theme: Record<string, string>) {
  const root = document.documentElement.style;
  if (theme.primaryColor) {
    root.setProperty('--color-primary', theme.primaryColor);
    root.setProperty('--color-primary-dark', darken(theme.primaryColor, 15));
  }
  if (theme.accentColor) {
    root.setProperty('--color-accent', theme.accentColor);
    root.setProperty('--color-accent-dark', darken(theme.accentColor, 15));
  }
  if (theme.headingFont) {
    loadGoogleFont(theme.headingFont);
    root.setProperty('--font-heading', `"${theme.headingFont}", system-ui, sans-serif`);
  } else {
    root.setProperty('--font-heading', 'system-ui, sans-serif');
  }
  if (theme.bodyFont) {
    loadGoogleFont(theme.bodyFont);
    root.setProperty('--font-body', `"${theme.bodyFont}", system-ui, sans-serif`);
  } else {
    root.setProperty('--font-body', 'system-ui, sans-serif');
  }
}

interface SiteConfigContextType {
  config: SiteConfig | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | null>(null);

const defaultConfig: SiteConfig = {
  id: 0,
  siteName: 'WebGenerica Store',
  logo: '',
  phone: '',
  email: '',
  address: '',
  socialLinks: {},
  theme: { primaryColor: '#2563eb', secondaryColor: '#1e40af', accentColor: '#f59e0b' },
  currency: '$',
  heroSlides: [
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
  shippingOptions: [],
  servicioTecnico: {
    heroTitle: 'Servicio Técnico',
    heroSubtitle: 'Nos especializamos en la reparación integral de teléfonos móviles, tablets y dispositivos electrónicos. Servicio profesional, eficiente y con garantía.',
    descTitle: 'Servicio de reparación',
    descBody: 'Nuestro objetivo es ofrecer un servicio técnico de alta calidad, profesional y eficiente, asegurando la plena satisfacción del cliente y la recuperación total de sus equipos en el menor tiempo posible. Contamos con un equipo de técnicos capacitados, experiencia comprobada en el rubro y el compromiso de trabajar con repuestos originales o de excelente calidad, según la necesidad del cliente.',
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
  },
  faq: {
    title: 'Preguntas Frecuentes',
    subtitle: 'Resolvé tus dudas antes de comprar o solicitar un servicio.',
    items: [
      { question: '¿Realizan envíos a todo el país?', answer: '¡Sí! Hacemos envíos a todos los departamentos a través de empresas de confianza. Una vez despachado tu pedido, te enviamos el número de seguimiento.' },
      { question: '¿Cuáles son los medios de pago disponibles?', answer: 'Aceptamos tarjetas de crédito y débito, transferencias bancarias, depósitos, y pagos por redes de cobranza. También podés pagar en efectivo si retirás en nuestro local.' },
      { question: '¿Puedo retirar en el local?', answer: '¡Claro! Podés elegir la opción "Retiro en local" al finalizar tu compra. Te avisamos por WhatsApp cuando tu pedido esté listo para retirar.' },
      { question: '¿Qué pasa si el producto llega dañado o no funciona?', answer: 'Si tu producto llega con algún problema, tenés hasta 72 horas para escribirnos. Nos encargamos del cambio o devolución sin vueltas.' },
      { question: '¿Cuánto demora la reparación de mi celular?', answer: 'El tiempo depende del tipo de falla y del modelo. Reparaciones comunes suelen demorar entre 1 y 2 horas. Otras más complejas pueden tardar entre 2 y 7 días.' },
      { question: '¿Tienen garantía las reparaciones?', answer: 'Sí, todas nuestras reparaciones tienen garantía escrita de 3 meses, cubriendo fallas relacionadas con el servicio realizado o los repuestos utilizados.' },
    ],
  },
};

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await configService.getSiteConfig();
      setConfig(data);
      applyThemeToDOM(data.theme || {});
    } catch {
      setConfig(defaultConfig);
      applyThemeToDOM(defaultConfig.theme);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <SiteConfigContext.Provider value={{ config: config || defaultConfig, loading, refresh }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfig must be used within SiteConfigProvider');
  return ctx;
}
