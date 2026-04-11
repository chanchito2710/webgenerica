import { useEffect, useState } from 'react';
import { configService } from '../../services/config.service';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadHints } from '../../constants/upload';
import type { AboutPageConfig, SectionStyles } from '../../types';
import ImageUploadZone from '../../components/admin/ImageUploadZone';
import SectionStyleEditor from '../../components/admin/SectionStyleEditor';
import DragList from '../../components/admin/DragList';

interface AboutForm extends Required<Omit<AboutPageConfig, 'heroStyles'>> {
  heroStyles?: SectionStyles;
}

const defaults: AboutForm = {
  title: '¿Quiénes Somos?',
  subtitle: '',
  description: '',
  image: '',
  mobileImage: '',
  highlights: ['Productos de calidad con garantía', 'Envíos a todo el país', 'Atención personalizada'],
};

export default function AdminAbout() {
  const { refresh } = useSiteConfig();
  const [form, setForm] = useState<AboutForm>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configService.getSiteConfig().then((data: any) => {
      if (data.aboutPage && typeof data.aboutPage === 'object' && Object.keys(data.aboutPage).length > 0) {
        setForm({ ...defaults, ...data.aboutPage });
      }
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await configService.updateSiteConfig({ aboutPage: form } as any);
      await refresh();
      toast.success('Guardado');
    } catch {
      toast.error('Error al guardar');
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  const updateHighlight = (i: number, value: string) => {
    const updated = [...form.highlights];
    updated[i] = value;
    setForm({ ...form, highlights: updated });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar "Quiénes Somos"</h1>

      <div className="space-y-6 max-w-3xl">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Contenido</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Título</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Subtítulo</label>
            <input className={inputClass} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Descripción</label>
            <textarea className={inputClass} rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Imágenes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Imagen principal (escritorio)</label>
              <ImageUploadZone value={form.image} onChange={(url) => setForm({ ...form, image: url })} hint={uploadHints.aboutImage} previewClass="h-32" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Imagen celular (opcional)</label>
              <ImageUploadZone value={form.mobileImage || ''} onChange={(url) => setForm({ ...form, mobileImage: url })} hint="750 × 1000 px · Vertical" previewClass="h-32" />
            </div>
          </div>
        </div>

        {/* Highlights with drag */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Puntos destacados</h2>
            <button type="button" onClick={() => setForm({ ...form, highlights: [...form.highlights, ''] })} className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium">
              <Plus size={16} /> Agregar
            </button>
          </div>
          <DragList
            items={form.highlights}
            onChange={(highlights) => setForm({ ...form, highlights })}
            keyFn={(_item, i) => i}
            renderItem={(h, i) => (
              <div className="flex items-center gap-2">
                <input className={inputClass} value={h} onChange={(e) => updateHighlight(i, e.target.value)} />
                <button type="button" onClick={() => setForm({ ...form, highlights: form.highlights.filter((_, idx) => idx !== i) })} className="text-red-500 p-2 hover:bg-red-50 rounded-lg shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
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
