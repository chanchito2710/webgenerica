import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { sectionBgStyle, sectionHeadingStyle } from '../utils/sectionStyle';
import type { ContactPageConfig } from '../types';

export default function Contact() {
  const { config } = useSiteConfig();
  const contactPage: ContactPageConfig = (config as any)?.contactPage || {};
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const phones = contactPage.phones?.length ? contactPage.phones : config?.phone ? [config.phone] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config?.email) {
      toast.error('Email de contacto no configurado');
      return;
    }
    const subject = encodeURIComponent(`Contacto desde web: ${form.name}`);
    const body = encodeURIComponent(`Nombre: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:${config.email}?subject=${subject}&body=${body}`);
    toast.success('Abriendo cliente de correo...');
  };

  const heroStyles = contactPage.heroStyles;
  const heroStyle = sectionBgStyle(heroStyles);
  const headingStyle = sectionHeadingStyle(heroStyles);

  return (
    <div>
      <SEO title="Contacto" />
      {heroStyle ? (
        <section className="bg-gradient-to-r from-primary to-primary-dark text-white bg-cover bg-center" style={heroStyle}>
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={headingStyle}>Contacto</h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">¿Tenés alguna consulta? Estamos para ayudarte</p>
          </div>
        </section>
      ) : null}
      <div className="max-w-6xl mx-auto px-4 py-12">
      {!heroStyle && <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Contacto</h1>}
      {!heroStyle && <p className="text-gray-500 text-center mb-10">¿Tenés alguna consulta? Estamos para ayudarte</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-xl border p-6 space-y-6 mb-6">
            {phones.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-full"><Phone size={18} className="text-primary" /></div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Teléfono</h3>
                  {phones.map((p, i) => (
                    <a key={i} href={`tel:${p}`} className="block text-sm text-gray-600 hover:text-primary">{p}</a>
                  ))}
                </div>
              </div>
            )}
            {config?.email && (
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-full"><Mail size={18} className="text-primary" /></div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Email</h3>
                  <a href={`mailto:${config.email}`} className="text-sm text-gray-600 hover:text-primary">{config.email}</a>
                </div>
              </div>
            )}
            {config?.address && (
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-full"><MapPin size={18} className="text-primary" /></div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Dirección</h3>
                  <p className="text-sm text-gray-600">{config.address}</p>
                </div>
              </div>
            )}
            {contactPage.hours && (
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-full"><Clock size={18} className="text-primary" /></div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Horarios</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{contactPage.hours}</p>
                </div>
              </div>
            )}
          </div>

          {contactPage.mapsEmbed && (
            <div className="rounded-xl overflow-hidden border h-64 lg:h-80">
              <iframe src={contactPage.mapsEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa" />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Envianos tu consulta</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Nombre</label>
            <input
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Mensaje</label>
            <textarea
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Send size={18} /> Enviar mensaje
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
