import { useEffect, useState } from 'react';
import { configService } from '../../services/config.service';
import { assertFileSizeWithinUploadLimit, uploadService } from '../../services/upload.service';
import { assetUrl } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Upload, Plus, Trash2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadHints } from '../../constants/upload';

interface AboutPage {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  highlights: string[];
}

const defaults: AboutPage = {
  title: '¿Quiénes Somos?',
  subtitle: '',
  description: '',
  image: '',
  highlights: ['Productos de calidad con garantía', 'Envíos a todo el país', 'Atención personalizada'],
};

export default function AdminAbout() {
  const { refresh } = useSiteConfig();
  const [form, setForm] = useState<AboutPage>(defaults);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
      return;
    }
    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file);
      setForm({ ...form, image: result.url });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar "Quiénes Somos"</h1>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white border rounded-lg p-6 space-y-4">
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

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Imagen</label>
            <p className="text-xs text-gray-500 mb-2">{uploadHints.aboutImage}</p>
            {form.image ? (
              <div className="relative group inline-block">
                <img src={assetUrl(form.image)} alt="" className="w-full max-w-xs rounded-lg border" />
                <button onClick={() => setForm({ ...form, image: '' })} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors max-w-xs">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{uploading ? 'Subiendo...' : 'Subir imagen'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImage}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Puntos destacados</label>
            <div className="space-y-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={h}
                    onChange={(e) => {
                      const updated = [...form.highlights];
                      updated[i] = e.target.value;
                      setForm({ ...form, highlights: updated });
                    }}
                  />
                  <button onClick={() => setForm({ ...form, highlights: form.highlights.filter((_, idx) => idx !== i) })} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, highlights: [...form.highlights, ''] })} className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium">
                <Plus size={16} /> Agregar
              </button>
            </div>
          </div>
        </div>

        <button onClick={save} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
