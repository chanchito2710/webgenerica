import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { configService } from '../../services/config.service';
import { assertFileSizeWithinUploadLimit, uploadService } from '../../services/upload.service';
import { assetUrl } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import type { ServicePageConfig, ServiceCard, SectionStyles } from '../../types';
import toast from 'react-hot-toast';
import SectionStyleEditor from '../../components/admin/SectionStyleEditor';
import ImageUploadZone from '../../components/admin/ImageUploadZone';
import DragList from '../../components/admin/DragList';
import GuideSection from '../../components/guide/GuideSection';

const ICON_OPTIONS = [
  { value: 'smartphone', label: 'Celular' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'wrench', label: 'Llave' },
  { value: 'check-circle', label: 'Check' },
  { value: 'clock', label: 'Reloj' },
  { value: 'shield', label: 'Escudo' },
  { value: 'cpu', label: 'CPU' },
  { value: 'hard-drive', label: 'Disco' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'battery', label: 'Batería' },
  { value: 'camera', label: 'Cámara' },
  { value: 'headphones', label: 'Auriculares' },
  { value: 'zap', label: 'Rayo' },
  { value: 'star', label: 'Estrella' },
  { value: 'heart', label: 'Corazón' },
  { value: 'truck', label: 'Camión' },
  { value: 'tool', label: 'Herramienta' },
  { value: 'custom', label: 'Subir ícono...' },
];

const DEFAULT_CONFIG: ServicePageConfig = {
  heroTitle: 'Servicio Técnico',
  heroSubtitle: 'Nos especializamos en la reparación integral de teléfonos móviles, tablets y dispositivos electrónicos.',
  descTitle: 'Servicio de reparación',
  descBody: '',
  servicesTitle: '¿Qué reparamos?',
  services: [],
  benefitsTitle: '¿Por qué elegirnos?',
  benefits: [],
  ctaTitle: '¿Tu celular necesita atención?',
  ctaSubtitle: 'Escribinos ahora por WhatsApp y te asesoramos sin compromiso.',
  ctaWhatsappMessage: 'Hola, necesito reparar mi dispositivo.',
};

function CardListEditor({
  cards,
  onChange,
  sectionLabel,
}: {
  cards: ServiceCard[];
  onChange: (cards: ServiceCard[]) => void;
  sectionLabel: string;
}) {
  const iconInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const add = () => onChange([...cards, { icon: 'wrench', title: '', desc: '' }]);
  const remove = (i: number) => onChange(cards.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof ServiceCard, value: string | undefined) => {
    const updated = [...cards];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  const handleIconUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
      const result = await uploadService.uploadImage(file);
      update(i, 'customIcon', result.url);
      update(i, 'icon', 'custom');
      toast.success('Ícono subido');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir ícono');
    }
  };

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="space-y-3">
      <DragList
        items={cards}
        onChange={onChange}
        keyFn={(_item, i) => i}
        renderItem={(card, i) => (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="shrink-0 space-y-1">
                <label className="text-xs text-gray-500 block">Ícono</label>
                <select
                  className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={card.icon === 'custom' ? 'custom' : card.icon}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setTimeout(() => iconInputRefs.current[i]?.click(), 50);
                    } else {
                      update(i, 'icon', e.target.value);
                      update(i, 'customIcon', undefined);
                    }
                  }}
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  ref={(el) => { iconInputRefs.current[i] = el; }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={(e) => handleIconUpload(i, e)}
                  className="hidden"
                />
                {card.icon === 'custom' && card.customIcon && (
                  <img src={assetUrl(card.customIcon)} alt="Ícono" className="w-10 h-10 rounded object-contain border bg-white" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Título</label>
                  <input className={inputClass} value={card.title} onChange={(e) => update(i, 'title', e.target.value)} placeholder={`Título del ${sectionLabel}`} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                  <input className={inputClass} value={card.desc} onChange={(e) => update(i, 'desc', e.target.value)} placeholder="Descripción breve" />
                </div>
              </div>
              <button type="button" onClick={() => remove(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-5">
                <Trash2 size={16} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Imagen (opcional)</label>
              <ImageUploadZone value={card.image || ''} onChange={(url) => update(i, 'image', url || undefined)} hint="400 × 300 px · JPG/PNG/WebP" previewClass="h-20" />
            </div>
          </div>
        )}
      />
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium">
        <Plus size={16} /> Agregar {sectionLabel}
      </button>
    </div>
  );
}

export default function AdminServicioTecnico() {
  const { refresh } = useSiteConfig();
  const [data, setData] = useState<ServicePageConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    configService.getSiteConfig().then((cfg) => {
      const raw = (cfg as any).servicioTecnico;
      if (raw && typeof raw === 'object' && raw.heroTitle) {
        setData({ ...DEFAULT_CONFIG, ...raw });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await configService.updateSiteConfig({ servicioTecnico: data });
      await refresh();
      toast.success('Servicio Técnico actualizado');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ServicePageConfig>(field: K, value: ServicePageConfig[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Servicio Técnico</h1>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Hero */}
        <GuideSection sectionId="hero">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Banner principal</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Título</label>
            <input className={inputClass} value={data.heroTitle} onChange={(e) => updateField('heroTitle', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Subtítulo</label>
            <textarea className={inputClass + ' min-h-[80px]'} value={data.heroSubtitle} onChange={(e) => updateField('heroSubtitle', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Imagen hero (escritorio)</label>
              <ImageUploadZone value={data.heroImage || ''} onChange={(url) => updateField('heroImage', url || undefined)} hint="1920 × 600 px · JPG/PNG/WebP" previewClass="h-24" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Imagen hero (celular)</label>
              <ImageUploadZone value={data.heroMobileImage || ''} onChange={(url) => updateField('heroMobileImage', url || undefined)} hint="750 × 1000 px · Vertical" previewClass="h-24" />
            </div>
          </div>
          <SectionStyleEditor
            styles={data.heroStyles || {}}
            onChange={(s) => updateField('heroStyles', s)}
          />
        </div>

        </GuideSection>

        {/* Description */}
        <GuideSection sectionId="desc">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Descripción</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Título de sección</label>
            <input className={inputClass} value={data.descTitle} onChange={(e) => updateField('descTitle', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Texto descriptivo</label>
            <textarea className={inputClass + ' min-h-[120px]'} value={data.descBody} onChange={(e) => updateField('descBody', e.target.value)} />
          </div>
        </div>

        </GuideSection>

        {/* Services */}
        <GuideSection sectionId="services">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Servicios</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Título de sección</label>
            <input className={inputClass} value={data.servicesTitle} onChange={(e) => updateField('servicesTitle', e.target.value)} />
          </div>
          <CardListEditor cards={data.services} onChange={(s) => updateField('services', s)} sectionLabel="servicio" />
        </div>

        </GuideSection>

        {/* Benefits */}
        <GuideSection sectionId="benefits">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Beneficios</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Título de sección</label>
            <input className={inputClass} value={data.benefitsTitle} onChange={(e) => updateField('benefitsTitle', e.target.value)} />
          </div>
          <CardListEditor cards={data.benefits} onChange={(b) => updateField('benefits', b)} sectionLabel="beneficio" />
        </div>

        </GuideSection>

        {/* CTA WhatsApp */}
        <GuideSection sectionId="cta">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Llamada a la acción (WhatsApp)</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Título</label>
            <input className={inputClass} value={data.ctaTitle} onChange={(e) => updateField('ctaTitle', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Subtítulo</label>
            <input className={inputClass} value={data.ctaSubtitle} onChange={(e) => updateField('ctaSubtitle', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Mensaje predeterminado de WhatsApp</label>
            <input className={inputClass} value={data.ctaWhatsappMessage} onChange={(e) => updateField('ctaWhatsappMessage', e.target.value)} />
          </div>
          <p className="text-xs text-gray-400">El número de teléfono se toma de la configuración general del sitio.</p>
          <SectionStyleEditor
            styles={data.ctaStyles || {}}
            onChange={(s) => updateField('ctaStyles', s)}
            showMobileBg={false}
          />
        </div>
        </GuideSection>

        <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
