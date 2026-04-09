import { useEffect, useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { configService } from '../../services/config.service';
import { useSiteConfig } from '../../context/SiteConfigContext';
import type { FaqPageConfig, FaqItem } from '../../types';
import toast from 'react-hot-toast';

const DEFAULT_CONFIG: FaqPageConfig = {
  title: 'Preguntas Frecuentes',
  subtitle: 'Resolvé tus dudas antes de comprar o solicitar un servicio.',
  items: [],
};

export default function AdminFAQ() {
  const { refresh } = useSiteConfig();
  const [data, setData] = useState<FaqPageConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    configService.getSiteConfig().then((cfg) => {
      const raw = (cfg as any).faq;
      if (raw && typeof raw === 'object' && raw.title) {
        setData({ ...DEFAULT_CONFIG, ...raw, items: Array.isArray(raw.items) ? raw.items : [] });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await configService.updateSiteConfig({ faq: data });
      await refresh();
      toast.success('Preguntas Frecuentes actualizadas');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { question: '', answer: '' }],
    }));
  };

  const removeItem = (index: number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof FaqItem, value: string) => {
    setData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const moveItem = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= data.items.length) return;
    setData((prev) => {
      const items = [...prev.items];
      [items[from], items[to]] = [items[to], items[from]];
      return { ...prev, items };
    });
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Preguntas Frecuentes</h1>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Title & subtitle */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Encabezado de la página</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Título</label>
            <input
              className={inputClass}
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Subtítulo</label>
            <input
              className={inputClass}
              value={data.subtitle}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            />
          </div>
        </div>

        {/* FAQ items */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Preguntas ({data.items.length})
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium"
            >
              <Plus size={16} /> Agregar pregunta
            </button>
          </div>

          {data.items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No hay preguntas cargadas. Hacé click en "Agregar pregunta" para empezar.
            </p>
          ) : (
            <div className="space-y-4">
              {data.items.map((item, i) => (
                <div key={i} className="border rounded-lg p-4 bg-gray-50 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => moveItem(i, -1)}
                        disabled={i === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Mover arriba"
                      >
                        <GripVertical size={14} />
                      </button>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Pregunta #{i + 1}</label>
                        <input
                          className={inputClass}
                          value={item.question}
                          onChange={(e) => updateItem(i, 'question', e.target.value)}
                          placeholder="Ej: ¿Realizan envíos a todo el país?"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Respuesta</label>
                        <textarea
                          className={inputClass + ' min-h-[80px]'}
                          value={item.answer}
                          onChange={(e) => updateItem(i, 'answer', e.target.value)}
                          placeholder="Escribí la respuesta completa..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Eliminar pregunta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <button
                      type="button"
                      onClick={() => moveItem(i, -1)}
                      disabled={i === 0}
                      className="text-xs text-gray-500 hover:text-primary disabled:opacity-30"
                    >
                      ↑ Subir
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(i, 1)}
                      disabled={i === data.items.length - 1}
                      className="text-xs text-gray-500 hover:text-primary disabled:opacity-30"
                    >
                      ↓ Bajar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
