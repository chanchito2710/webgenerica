import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import SEO from '../components/SEO';
import { sectionBgStyle, sectionHeadingStyle } from '../utils/sectionStyle';
import type { FaqPageConfig } from '../types';

const fallback: FaqPageConfig = {
  title: 'Preguntas Frecuentes',
  subtitle: 'Resolvé tus dudas antes de comprar o solicitar un servicio.',
  items: [],
};

function AccordionItem({ question, answer, image }: { question: string; answer: string; image?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 px-1 text-left group"
      >
        <span className="font-medium text-gray-800 group-hover:text-primary transition-colors">{question}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[800px] pb-5' : 'max-h-0'}`}
      >
        <p className="text-gray-600 leading-relaxed px-1 whitespace-pre-line">{answer}</p>
        {image && <img src={assetUrl(image)} alt="" className="mt-3 rounded-lg max-h-48 object-cover" />}
      </div>
    </div>
  );
}

export default function FAQ() {
  const { config } = useSiteConfig();
  const faq = config?.faq?.title ? config.faq : fallback;

  if (faq.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <SEO title="Preguntas Frecuentes" />
        <HelpCircle size={64} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Preguntas Frecuentes</h1>
        <p className="text-gray-500">Próximamente agregaremos respuestas a las dudas más comunes.</p>
      </div>
    );
  }

  return (
    <div>
      <SEO title="Preguntas Frecuentes" />
      {/* Hero */}
      <section
        className="bg-gradient-to-r from-primary to-primary-dark text-white bg-cover bg-center"
        style={sectionBgStyle(faq.heroStyles)}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          <HelpCircle size={48} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={sectionHeadingStyle(faq.heroStyles)}>{faq.title}</h1>
          {faq.subtitle && (
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">{faq.subtitle}</p>
          )}
        </div>
      </section>

      {/* Accordion */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-xl p-6 sm:p-8 shadow-sm -mt-8 relative z-10">
          {faq.items.map((item, i) => (
            <AccordionItem key={i} question={item.question} answer={item.answer} image={item.image} />
          ))}
        </div>
      </section>
    </div>
  );
}
