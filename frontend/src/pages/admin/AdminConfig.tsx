import { useEffect, useState, useRef } from 'react';
import { configService } from '../../services/config.service';
import { assertFileSizeWithinUploadLimit, uploadService } from '../../services/upload.service';
import { assetUrl } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import type { SiteConfig, ShippingOption } from '../../types';
import { Plus, Trash2, Truck, Upload, Palette, Share2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadHints } from '../../constants/upload';
import { FONT_OPTIONS, loadGoogleFont } from '../../utils/fonts';
import GuideSection from '../../components/guide/GuideSection';

function generateId() {
  return `ship_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeRecord(v: unknown): Record<string, string> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string>) : {};
}

export default function AdminConfig() {
  const { refresh } = useSiteConfig();
  const [form, setForm] = useState<Partial<SiteConfig>>({});
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    configService.getSiteConfig().then((data) => {
      setForm({
        ...data,
        socialLinks: normalizeRecord(data.socialLinks),
        theme: normalizeRecord(data.theme),
      });
      setShippingOptions(Array.isArray((data as any).shippingOptions) ? (data as any).shippingOptions : []);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir el logo');
      return;
    }
    setUploadingLogo(true);
    try {
      const result = await uploadService.uploadImage(file);
      setForm((prev) => ({ ...prev, logo: result.url }));
      toast.success('Logo subido');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const updateSocialLink = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...normalizeRecord(prev.socialLinks), [key]: value },
    }));
  };

  const updateThemeColor = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      theme: { ...normalizeRecord(prev.theme), [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await configService.updateSiteConfig({ ...form, shippingOptions });
      await refresh();
      toast.success('Configuración actualizada');
    } catch {
      toast.error('Error al guardar');
    }
  };

  const addShippingOption = () => {
    setShippingOptions([...shippingOptions, { id: generateId(), name: '', description: '', cost: 0 }]);
  };

  const updateShippingOption = (index: number, field: keyof ShippingOption, value: string | number) => {
    const updated = [...shippingOptions];
    updated[index] = { ...updated[index], [field]: value };
    setShippingOptions(updated);
  };

  const removeShippingOption = (index: number) => {
    setShippingOptions(shippingOptions.filter((_, i) => i !== index));
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Sitio</h1>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* General config */}
        <GuideSection sectionId="general">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Datos generales</h2>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Nombre del sitio</label>
            <input className={inputClass} value={form.siteName || ''} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Teléfono</label>
            <input className={inputClass} value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input type="email" className={inputClass} value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Dirección</label>
            <input className={inputClass} value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Moneda</label>
            <input className={inputClass} value={form.currency || ''} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
        </div>

        {/* Logo (FASE 5A) */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Image size={20} /> Logo del sitio
          </h2>
          <p className="text-sm text-gray-500">Imagen que se muestra en el encabezado y enlaces al sitio.</p>
          <p className="text-xs text-gray-500">{uploadHints.siteLogo}</p>
          {form.logo ? (
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="relative group shrink-0">
                <div className="h-24 w-40 rounded-lg border bg-gray-50 flex items-center justify-center p-3">
                  <img src={assetUrl(form.logo)} alt="Logo actual" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload size={16} />
                  {uploadingLogo ? 'Subiendo…' : 'Cambiar logo'}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={uploadingLogo}
                    onChange={handleLogoUpload}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, logo: '' }))}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <Upload size={24} className="text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">{uploadingLogo ? 'Subiendo…' : 'Subir logo'}</span>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploadingLogo}
                onChange={handleLogoUpload}
              />
            </label>
          )}
        </div>

        </GuideSection>

        {/* Social links (FASE 5B) */}
        <GuideSection sectionId="social">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Share2 size={20} /> Redes sociales
          </h2>
          <p className="text-sm text-gray-500">URLs completas de tus perfiles (opcional).</p>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Instagram</label>
              <input
                type="url"
                className={inputClass}
                placeholder="https://instagram.com/..."
                value={normalizeRecord(form.socialLinks).instagram || ''}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Facebook</label>
              <input
                type="url"
                className={inputClass}
                placeholder="https://facebook.com/..."
                value={normalizeRecord(form.socialLinks).facebook || ''}
                onChange={(e) => updateSocialLink('facebook', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Twitter / X</label>
              <input
                type="url"
                className={inputClass}
                placeholder="https://x.com/..."
                value={normalizeRecord(form.socialLinks).twitter || ''}
                onChange={(e) => updateSocialLink('twitter', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">TikTok</label>
              <input
                type="url"
                className={inputClass}
                placeholder="https://tiktok.com/@..."
                value={normalizeRecord(form.socialLinks).tiktok || ''}
                onChange={(e) => updateSocialLink('tiktok', e.target.value)}
              />
            </div>
          </div>
        </div>

        </GuideSection>

        {/* Theme / colors (FASE 5C) */}
        <GuideSection sectionId="theme">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Palette size={20} /> Colores del tema
          </h2>
          <p className="text-sm text-gray-500">Color principal y de acento para la identidad visual.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Color primario</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-10 w-14 rounded border border-gray-200 cursor-pointer shrink-0 p-0.5"
                  value={normalizeRecord(form.theme).primaryColor || '#3b82f6'}
                  onChange={(e) => updateThemeColor('primaryColor', e.target.value)}
                />
                <input
                  className={inputClass}
                  value={normalizeRecord(form.theme).primaryColor || ''}
                  onChange={(e) => updateThemeColor('primaryColor', e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Color de acento</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-10 w-14 rounded border border-gray-200 cursor-pointer shrink-0 p-0.5"
                  value={normalizeRecord(form.theme).accentColor || '#8b5cf6'}
                  onChange={(e) => updateThemeColor('accentColor', e.target.value)}
                />
                <input
                  className={inputClass}
                  value={normalizeRecord(form.theme).accentColor || ''}
                  onChange={(e) => updateThemeColor('accentColor', e.target.value)}
                  placeholder="#8b5cf6"
                />
              </div>
            </div>
          </div>

          {/* Fuentes globales */}
          <div className="border-t pt-4 mt-4 space-y-4">
            <h3 className="text-base font-medium text-gray-700">Tipografía</h3>
            <p className="text-sm text-gray-500">Elegí las fuentes para títulos y cuerpo de texto de toda la tienda.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Fuente de títulos</label>
                <select
                  className={inputClass}
                  value={normalizeRecord(form.theme).headingFont || ''}
                  onChange={(e) => {
                    updateThemeColor('headingFont', e.target.value);
                    if (e.target.value) loadGoogleFont(e.target.value);
                  }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                {normalizeRecord(form.theme).headingFont && (
                  <p className="mt-2 text-lg text-gray-700" style={{ fontFamily: `"${normalizeRecord(form.theme).headingFont}", sans-serif` }}>
                    Vista previa de título
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Fuente de cuerpo</label>
                <select
                  className={inputClass}
                  value={normalizeRecord(form.theme).bodyFont || ''}
                  onChange={(e) => {
                    updateThemeColor('bodyFont', e.target.value);
                    if (e.target.value) loadGoogleFont(e.target.value);
                  }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                {normalizeRecord(form.theme).bodyFont && (
                  <p className="mt-2 text-sm text-gray-700" style={{ fontFamily: `"${normalizeRecord(form.theme).bodyFont}", sans-serif` }}>
                    Vista previa del texto de cuerpo. Así se vería en párrafos y descripciones.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        </GuideSection>

        {/* Footer description (FASE 5F) */}
        <GuideSection sectionId="footer">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Texto del pie de página</h2>
          <p className="text-sm text-gray-500">Descripción breve que aparece en el footer del sitio.</p>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Descripción</label>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              rows={4}
              value={String((form as any).footerDescription ?? '')}
              onChange={(e) => setForm({ ...form, footerDescription: e.target.value } as Partial<SiteConfig>)}
              placeholder="Ej: Tu tienda de confianza desde 2010…"
            />
          </div>
        </div>

        </GuideSection>

        {/* Shipping options */}
        <GuideSection sectionId="shipping">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Truck size={20} /> Opciones de envío
            </h2>
            <button type="button" onClick={addShippingOption} className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium">
              <Plus size={16} /> Agregar
            </button>
          </div>

          {shippingOptions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No hay opciones de envío configuradas. Los clientes no verán opciones de envío en el checkout.</p>
          ) : (
            <div className="space-y-3">
              {shippingOptions.map((option, index) => (
                <div key={option.id} className="border rounded-lg p-4 bg-gray-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
                        <input
                          className={inputClass}
                          value={option.name}
                          onChange={(e) => updateShippingOption(index, 'name', e.target.value)}
                          placeholder="Ej: Envío a domicilio"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Costo ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputClass}
                          value={option.cost}
                          onChange={(e) => updateShippingOption(index, 'cost', parseFloat(e.target.value) || 0)}
                          placeholder="0 = gratis"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeShippingOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                    <input
                      className={inputClass}
                      value={option.description}
                      onChange={(e) => updateShippingOption(index, 'description', e.target.value)}
                      placeholder="Ej: Entrega en 3-5 días hábiles"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </GuideSection>

        <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
