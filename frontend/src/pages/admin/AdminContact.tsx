import { useEffect, useState } from 'react';
import { configService } from '../../services/config.service';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Plus, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ContactPageConfig, SectionStyles } from '../../types';
import ImageUploadZone from '../../components/admin/ImageUploadZone';
import SectionStyleEditor from '../../components/admin/SectionStyleEditor';
import DragList from '../../components/admin/DragList';

interface ContactForm extends Required<Omit<ContactPageConfig, 'heroStyles'>> {
  heroStyles?: SectionStyles;
}

const defaults: ContactForm = {
  phones: [],
  mapsEmbed: '',
  hours: '',
  image: '',
  mobileImage: '',
};

export default function AdminContact() {
  const { refresh } = useSiteConfig();
  const [form, setForm] = useState<ContactForm>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configService.getSiteConfig().then((data: any) => {
      if (data.contactPage && typeof data.contactPage === 'object' && Object.keys(data.contactPage).length > 0) {
        setForm({ ...defaults, ...data.contactPage });
      }
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await configService.updateSiteConfig({ contactPage: form } as any);
      await refresh();
      toast.success('Guardado');
    } catch {
      toast.error('Error al guardar');
    }
  };

  const updatePhone = (i: number, value: string) => {
    const updated = [...form.phones];
    updated[i] = value;
    setForm({ ...form, phones: updated });
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MapPin size={24} /> Editar Contacto
      </h1>

      <div className="space-y-6 max-w-3xl">
        {/* Phones with drag */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Teléfonos</h2>
            <button type="button" onClick={() => setForm({ ...form, phones: [...form.phones, ''] })} className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium">
              <Plus size={16} /> Agregar teléfono
            </button>
          </div>
          {form.phones.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No hay teléfonos cargados.</p>
          ) : (
            <DragList
              items={form.phones}
              onChange={(phones) => setForm({ ...form, phones })}
              keyFn={(_item, i) => i}
              renderItem={(p, i) => (
                <div className="flex items-center gap-2">
                  <input className={inputClass} value={p} onChange={(e) => updatePhone(i, e.target.value)} placeholder="Ej: +54 11 1234-5678" />
                  <button type="button" onClick={() => setForm({ ...form, phones: form.phones.filter((_, idx) => idx !== i) })} className="text-red-500 p-2 hover:bg-red-50 rounded-lg shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          )}
        </div>

        {/* Map + hours */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Mapa y horarios</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Embed de Google Maps (URL del iframe)</label>
            <input className={inputClass} value={form.mapsEmbed} onChange={(e) => setForm({ ...form, mapsEmbed: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=..." />
            <p className="text-[10px] text-gray-400 mt-1">Pegá la URL del src del iframe de Google Maps</p>
            {form.mapsEmbed && (
              <div className="mt-2 rounded-lg overflow-hidden border h-48">
                <iframe src={form.mapsEmbed} width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Preview" />
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Horarios de atención</label>
            <textarea className={inputClass} rows={4} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="Lunes a Viernes: 9:00 - 18:00&#10;Sábados: 9:00 - 13:00" />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Imágenes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Imagen de la sección (escritorio)</label>
              <ImageUploadZone value={form.image || ''} onChange={(url) => setForm({ ...form, image: url })} hint="1200 × 800 px · JPG/PNG/WebP" previewClass="h-28" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Imagen celular (opcional)</label>
              <ImageUploadZone value={form.mobileImage || ''} onChange={(url) => setForm({ ...form, mobileImage: url })} hint="750 × 1000 px · Vertical" previewClass="h-28" />
            </div>
          </div>
        </div>

        {/* Hero style */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Estilo del encabezado</h2>
          <SectionStyleEditor
            styles={form.heroStyles || {}}
            onChange={(s) => setForm({ ...form, heroStyles: s })}
          />
        </div>

        <button onClick={save} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
