import { useEffect, useState, useRef } from 'react';
import { Upload, Plus, Trash2, Image, GripVertical, Link as LinkIcon, MousePointerClick, Paintbrush, ChevronDown, ChevronUp, LayoutGrid, Type, ShoppingBag, Megaphone } from 'lucide-react';
import { InstagramIcon } from '../../components/SocialIcons';
import { configService } from '../../services/config.service';
import { assertFileSizeWithinUploadLimit, uploadService } from '../../services/upload.service';
import { productService } from '../../services/product.service';
import { assetUrl } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useDragReorder } from '../../hooks/useDragReorder';
import { FONT_OPTIONS, loadGoogleFont } from '../../utils/fonts';
import type { HeroSlide, HeroButton, SlideStyles, SlideLayout, SlideCustomText, Benefit, Product, InstagramSection, PromoBanner } from '../../types';
import toast from 'react-hot-toast';
import { uploadHints } from '../../constants/upload';
import GuideSection from '../../components/guide/GuideSection';

const ICON_OPTIONS = [
  { value: 'truck', label: 'Camión (envíos)' },
  { value: 'credit-card', label: 'Tarjeta (pagos)' },
  { value: 'wrench', label: 'Llave (servicio técnico)' },
  { value: 'custom', label: 'Subir ícono...' },
];

const DEFAULT_BUTTONS: HeroButton[] = [
  { text: 'Ver Productos', url: '/tienda', style: 'primary' },
  { text: 'Servicio Técnico', url: '/servicio-tecnico', style: 'primary' },
  { text: 'Contacto', url: '/contacto', style: 'outline' },
];

function normalizeSlides(raw: unknown): HeroSlide[] {
  if (Array.isArray(raw)) return raw.map((s) => ({
    ...s,
    buttons: Array.isArray(s.buttons) ? s.buttons : DEFAULT_BUTTONS,
  }));
  if (raw && typeof raw === 'object' && 'imageUrl' in raw) {
    const s = raw as any;
    return [{ ...s, buttons: Array.isArray(s.buttons) ? s.buttons : DEFAULT_BUTTONS }];
  }
  return [];
}

/* ─── Drag handle component ─── */

function DragGrip({ handlers, className = '' }: { handlers: Pick<ReturnType<typeof useDragReorder>['getItemHandlers'] extends (i: number) => infer R ? R : never, 'onTouchStart' | 'onTouchMove' | 'onTouchEnd'>; className?: string }) {
  return (
    <div
      className={`cursor-grab active:cursor-grabbing touch-none ${className}`}
      onTouchStart={handlers.onTouchStart}
      onTouchMove={handlers.onTouchMove}
      onTouchEnd={handlers.onTouchEnd}
    >
      <GripVertical size={16} className="text-gray-400" />
    </div>
  );
}

/* ─── Button row with drag for buttons inside a slide ─── */

function SlideButtonsEditor({
  slideIdx,
  buttons,
  onUpdate,
}: {
  slideIdx: number;
  buttons: HeroButton[];
  onUpdate: (btns: HeroButton[]) => void;
}) {
  const drag = useDragReorder(buttons, onUpdate);
  const [expandedColors, setExpandedColors] = useState<number | null>(null);

  const addBtn = () => onUpdate([...buttons, { text: '', url: '/', style: 'primary' }]);
  const removeBtn = (j: number) => {
    onUpdate(buttons.filter((_, k) => k !== j));
    if (expandedColors === j) setExpandedColors(null);
  };
  const updateBtn = (j: number, field: keyof HeroButton, value: string) => {
    const updated = [...buttons];
    updated[j] = { ...updated[j], [field]: value === '' ? undefined as any : value };
    onUpdate(updated);
  };

  return (
    <div className="border-t pt-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
          <MousePointerClick size={14} /> Botones del slide
        </h4>
        <button onClick={addBtn} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
          <Plus size={14} /> Agregar botón
        </button>
      </div>

      {buttons.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">Sin botones. Se usarán los por defecto.</p>
      ) : (
        <div className="space-y-2">
          {buttons.map((btn, j) => {
            const h = drag.getItemHandlers(j);
            const isOver = drag.overIdx === j && drag.dragIdx !== null && drag.dragIdx !== j;
            const hasColors = !!(btn.bgColor || btn.textColor || btn.borderColor);
            return (
              <div
                key={`${slideIdx}-btn-${j}`}
                ref={drag.setItemRef(j)}
                draggable
                onDragStart={h.onDragStart}
                onDragOver={h.onDragOver}
                onDrop={h.onDrop}
                onDragEnd={h.onDragEnd}
                className={`bg-white border rounded-lg p-2 transition-all ${
                  drag.dragIdx === j ? 'opacity-50 scale-[0.98]' : ''
                } ${isOver ? 'border-primary shadow-sm ring-2 ring-primary/20' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <DragGrip handlers={h} />

                  <input
                    className="border rounded px-2 py-1.5 text-sm flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={btn.text}
                    onChange={(e) => updateBtn(j, 'text', e.target.value)}
                    placeholder="Texto del botón"
                  />

                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <LinkIcon size={14} className="text-gray-400 shrink-0" />
                    <input
                      className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                      value={btn.url}
                      onChange={(e) => updateBtn(j, 'url', e.target.value)}
                      placeholder="/tienda o https://..."
                    />
                  </div>

                  <select
                    className="border rounded px-2 py-1.5 text-xs shrink-0 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={btn.style}
                    onChange={(e) => updateBtn(j, 'style', e.target.value)}
                  >
                    <option value="primary">Relleno</option>
                    <option value="outline">Borde</option>
                  </select>

                  <button
                    onClick={() => setExpandedColors(expandedColors === j ? null : j)}
                    className={`p-1 shrink-0 rounded transition-colors ${hasColors ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Colores personalizados"
                  >
                    <Paintbrush size={14} />
                  </button>

                  <button onClick={() => removeBtn(j)} className="p-1 text-red-400 hover:text-red-600 shrink-0" title="Eliminar botón">
                    <Trash2 size={14} />
                  </button>
                </div>

                {expandedColors === j && (
                  <div className="mt-2 pt-2 border-t flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Fondo:</span>
                      <input type="color" value={btn.bgColor || '#ffffff'} onChange={(e) => updateBtn(j, 'bgColor', e.target.value)} className="w-6 h-6 rounded border cursor-pointer" />
                      {btn.bgColor && <button onClick={() => updateBtn(j, 'bgColor', '')} className="text-red-500 hover:underline">x</button>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Texto:</span>
                      <input type="color" value={btn.textColor || '#2563eb'} onChange={(e) => updateBtn(j, 'textColor', e.target.value)} className="w-6 h-6 rounded border cursor-pointer" />
                      {btn.textColor && <button onClick={() => updateBtn(j, 'textColor', '')} className="text-red-500 hover:underline">x</button>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Borde:</span>
                      <input type="color" value={btn.borderColor || '#ffffff'} onChange={(e) => updateBtn(j, 'borderColor', e.target.value)} className="w-6 h-6 rounded border cursor-pointer" />
                      {btn.borderColor && <button onClick={() => updateBtn(j, 'borderColor', '')} className="text-red-500 hover:underline">x</button>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Layout selector ─── */

const LAYOUT_OPTIONS: { value: SlideLayout; label: string; lines: [string, string, string] }[] = [
  { value: 'centered', label: 'Centrado', lines: ['mx-auto', 'mx-auto', 'mx-auto'] },
  { value: 'left', label: 'Izquierda', lines: ['mr-auto', 'mr-auto', 'mr-auto'] },
  { value: 'right', label: 'Derecha', lines: ['ml-auto', 'ml-auto', 'ml-auto'] },
  { value: 'bottom-left', label: 'Inf. izq.', lines: ['mr-auto mt-auto', 'mr-auto', 'mr-auto'] },
  { value: 'bottom-center', label: 'Inf. centro', lines: ['mx-auto mt-auto', 'mx-auto', 'mx-auto'] },
  { value: 'top-left', label: 'Sup. izq.', lines: ['mr-auto', 'mr-auto', 'mr-auto'] },
];

function LayoutSelector({
  layout,
  onChange,
}: {
  layout: SlideLayout;
  onChange: (l: SlideLayout) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const current = LAYOUT_OPTIONS.find((o) => o.value === layout) || LAYOUT_OPTIONS[0];

  return (
    <div className="border-t pt-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-primary transition-colors"
      >
        <LayoutGrid size={14} />
        Diseño: {current.label}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                layout === opt.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="w-12 h-8 bg-gray-100 rounded border border-gray-200 flex flex-col gap-px p-1 justify-between">
                {opt.lines.map((align, k) => (
                  <div key={k} className={`${align} ${k === 0 ? 'w-6 h-1 bg-gray-400 rounded-sm' : k === 1 ? 'w-4 h-0.5 bg-gray-300 rounded-sm' : 'flex gap-px'}`}>
                    {k === 2 && (
                      <>
                        <div className="w-1.5 h-1 bg-primary/60 rounded-sm" />
                        <div className="w-1.5 h-1 bg-gray-300 rounded-sm" />
                      </>
                    )}
                  </div>
                ))}
              </div>
              <span className={`text-[10px] leading-tight ${layout === opt.value ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom text editor ─── */

const FONT_SIZE_OPTIONS = [
  { value: 'sm', label: 'Chico' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra grande' },
];

const FONT_WEIGHT_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'semibold', label: 'Seminegrita' },
  { value: 'bold', label: 'Negrita' },
];

function CustomTextEditor({
  customText,
  onChange,
}: {
  customText?: SlideCustomText;
  onChange: (ct: SlideCustomText | undefined) => void;
}) {
  const [expanded, setExpanded] = useState(!!customText?.text);
  const ct = customText || { text: '' };

  const update = (field: keyof SlideCustomText, value: string) => {
    const updated = { ...ct, [field]: value || undefined };
    if (field === 'font' && value) loadGoogleFont(value);
    onChange(updated.text ? updated : undefined);
  };

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
  const selectCls = 'w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="border-t pt-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-primary transition-colors"
      >
        <Type size={14} />
        Texto adicional
        {ct.text && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Texto</label>
            <input
              className={inputCls}
              value={ct.text || ''}
              onChange={(e) => update('text', e.target.value)}
              placeholder="Ej: Hasta 30% OFF en celulares"
            />
          </div>

          {ct.text && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Fuente</label>
                <select className={selectCls} value={ct.font || ''} onChange={(e) => update('font', e.target.value)}>
                  {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Tamaño</label>
                <select className={selectCls} value={ct.fontSize || 'base'} onChange={(e) => update('fontSize', e.target.value)}>
                  {FONT_SIZE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Peso</label>
                <select className={selectCls} value={ct.fontWeight || 'normal'} onChange={(e) => update('fontWeight', e.target.value)}>
                  {FONT_WEIGHT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Color texto</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={ct.color || '#ffffff'} onChange={(e) => update('color', e.target.value)} className="w-6 h-6 rounded border cursor-pointer" />
                  <span className="text-[10px] text-gray-500">{ct.color || 'Blanco'}</span>
                  {ct.color && <button type="button" onClick={() => update('color', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Color fondo</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={ct.bgColor || '#000000'} onChange={(e) => update('bgColor', e.target.value)} className="w-6 h-6 rounded border cursor-pointer" />
                  <span className="text-[10px] text-gray-500">{ct.bgColor || 'Sin fondo'}</span>
                  {ct.bgColor && <button type="button" onClick={() => update('bgColor', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>}
                </div>
              </div>
            </div>
          )}

          {ct.text && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs text-red-500 hover:underline font-medium flex items-center gap-1"
            >
              <Trash2 size={12} /> Quitar texto adicional
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Slide styles editor ─── */

function SlideStylesEditor({
  styles,
  onUpdate,
}: {
  styles: SlideStyles;
  onUpdate: (field: keyof SlideStyles, value: string | number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasStyles = !!(styles.titleFont || styles.titleColor || styles.subtitleFont || styles.subtitleColor || styles.buttonFont || styles.overlayColor);

  const selectCls = 'w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="border-t pt-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-primary transition-colors"
      >
        <Paintbrush size={14} />
        Estilos del slide
        {hasStyles && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Title font + color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Fuente título</label>
            <select className={selectCls} value={styles.titleFont || ''} onChange={(e) => onUpdate('titleFont', e.target.value)}>
              {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Color:</span>
              <input type="color" value={styles.titleColor || '#ffffff'} onChange={(e) => onUpdate('titleColor', e.target.value)} className="w-6 h-6 rounded border cursor-pointer" />
              {styles.titleColor && <button onClick={() => onUpdate('titleColor', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>}
            </div>
          </div>

          {/* Subtitle font + color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Fuente subtítulo</label>
            <select className={selectCls} value={styles.subtitleFont || ''} onChange={(e) => onUpdate('subtitleFont', e.target.value)}>
              {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Color:</span>
              <input type="color" value={styles.subtitleColor || '#ffffff'} onChange={(e) => onUpdate('subtitleColor', e.target.value)} className="w-6 h-6 rounded border cursor-pointer" />
              {styles.subtitleColor && <button onClick={() => onUpdate('subtitleColor', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>}
            </div>
          </div>

          {/* Button font */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Fuente botones</label>
            <select className={selectCls} value={styles.buttonFont || ''} onChange={(e) => onUpdate('buttonFont', e.target.value)}>
              {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {/* Overlay */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block">Fondo overlay</label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <input type="color" value={styles.overlayColor || '#000000'} onChange={(e) => onUpdate('overlayColor', e.target.value)} className="w-6 h-6 rounded border cursor-pointer" />
                <span className="text-xs text-gray-500">{styles.overlayColor || 'Degradado por defecto'}</span>
                {styles.overlayColor && (
                  <button onClick={() => { onUpdate('overlayColor', ''); onUpdate('overlayOpacity', '' as any); }} className="text-[10px] text-red-500 hover:underline">Quitar</button>
                )}
              </div>
              {styles.overlayColor && (
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                  <span className="text-[10px] text-gray-500 shrink-0">Opacidad:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={styles.overlayOpacity ?? 50}
                    onChange={(e) => onUpdate('overlayOpacity', Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs text-gray-600 font-medium w-8 text-right">{styles.overlayOpacity ?? 50}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main AdminHome ─── */

export default function AdminHome() {
  const { refresh } = useSiteConfig();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);
  const [uploadingIconIdx, setUploadingIconIdx] = useState<number | null>(null);
  const iconInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [instagramSection, setInstagramSection] = useState<InstagramSection>({ title: '', url: '', username: '' });
  const [promoBannerState, setPromoBannerState] = useState<PromoBanner>({ imageUrl: '', title: '', subtitle: '', linkUrl: '', linkText: '' });
  const [instagramOpen, setInstagramOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [savingInstagram, setSavingInstagram] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);

  const slideDrag = useDragReorder(slides, setSlides);

  useEffect(() => {
    Promise.all([
      configService.getSiteConfig(),
      productService.getAllProducts({ limit: '200' }),
    ]).then(([data, prodRes]: [any, any]) => {
      setSlides(normalizeSlides(data.heroSlides ?? data.heroBanner));
      if (Array.isArray(data.benefits)) {
        setBenefits(data.benefits as Benefit[]);
      }
      setProducts(prodRes.products || []);
      const ig = data.instagramSection;
      if (ig && typeof ig === 'object') {
        setInstagramSection({
          title: ig.title ?? '',
          url: ig.url ?? '',
          username: ig.username ?? '',
        });
      }
      const pb = data.promoBanner;
      if (pb && typeof pb === 'object') {
        setPromoBannerState({
          imageUrl: pb.imageUrl ?? '',
          title: pb.title ?? '',
          subtitle: pb.subtitle ?? '',
          linkUrl: pb.linkUrl ?? '',
          linkText: pb.linkText ?? '',
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  // --- Slide handlers ---

  const handleSlideImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
      return;
    }
    setUploadingSlideIdx(index);
    try {
      const result = await uploadService.uploadImage(file);
      const updated = [...slides];
      updated[index] = { ...updated[index], imageUrl: result.url };
      setSlides(updated);
      toast.success('Imagen subida');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const addSlide = () => {
    setSlides([...slides, { imageUrl: '', title: '', subtitle: '', buttons: [...DEFAULT_BUTTONS], type: 'generic' }]);
  };

  const addProductSlide = () => {
    setSlides([...slides, { imageUrl: '', title: '', subtitle: '', buttons: [], type: 'product' }]);
  };

  const selectProductForSlide = (index: number, productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const imgUrl = product.images?.[0]?.url || '';
    const updated = [...slides];
    updated[index] = {
      ...updated[index],
      type: 'product',
      productId: product.id,
      productSlug: product.slug,
      imageUrl: imgUrl,
      mobileImageUrl: imgUrl,
      title: product.name,
      subtitle: product.description || '',
      buttons: [{ text: 'Ver más', url: `/producto/${product.slug}`, style: 'primary' }],
      backgroundUrl: updated[index].backgroundUrl || '',
      mobileBackgroundUrl: updated[index].mobileBackgroundUrl || '',
    };
    setSlides(updated);
  };

  const handleMobileImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
      return;
    }
    setUploadingSlideIdx(index);
    try {
      const result = await uploadService.uploadImage(file);
      const updated = [...slides];
      updated[index] = { ...updated[index], mobileImageUrl: result.url };
      setSlides(updated);
      toast.success('Imagen celular subida');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const handleBgImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
      return;
    }
    setUploadingSlideIdx(index);
    try {
      const result = await uploadService.uploadImage(file);
      const updated = [...slides];
      updated[index] = { ...updated[index], backgroundUrl: result.url };
      setSlides(updated);
      toast.success('Imagen de fondo subida');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const handleMobileBgImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
      return;
    }
    setUploadingSlideIdx(index);
    try {
      const result = await uploadService.uploadImage(file);
      const updated = [...slides];
      updated[index] = { ...updated[index], mobileBackgroundUrl: result.url };
      setSlides(updated);
      toast.success('Imagen de fondo celular subida');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const updateSlideField = (index: number, field: 'imageUrl' | 'mobileImageUrl' | 'title' | 'subtitle' | 'backgroundUrl' | 'mobileBackgroundUrl', value: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const updateSlideButtons = (index: number, btns: HeroButton[]) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], buttons: btns };
    setSlides(updated);
  };

  const updateSlideStyles = (index: number, field: keyof SlideStyles, value: string | number) => {
    const updated = [...slides];
    const current = updated[index].styles || {};
    const v = value === '' ? undefined : value;
    updated[index] = { ...updated[index], styles: { ...current, [field]: v } };
    setSlides(updated);
    if (typeof value === 'string' && value && ['titleFont', 'subtitleFont', 'buttonFont'].includes(field)) {
      loadGoogleFont(value);
    }
  };

  const updateSlideLayout = (index: number, layout: SlideLayout) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], layout };
    setSlides(updated);
  };

  const updateSlideCustomText = (index: number, customText: SlideCustomText | undefined) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], customText };
    setSlides(updated);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  // --- Benefit handlers ---

  const handleIconUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir ícono');
      return;
    }
    setUploadingIconIdx(index);
    try {
      const result = await uploadService.uploadImage(file);
      const updated = [...benefits];
      updated[index] = { ...updated[index], icon: 'custom', customIcon: result.url };
      setBenefits(updated);
      toast.success('Ícono subido');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir ícono');
    } finally {
      setUploadingIconIdx(null);
    }
  };

  const addBenefit = () => {
    setBenefits([...benefits, { icon: 'truck', title: '', description: '' }]);
  };

  const updateBenefit = (index: number, field: keyof Benefit, value: string) => {
    const updated = [...benefits];
    if (field === 'icon' && value === 'custom') {
      setTimeout(() => iconInputRefs.current[index]?.click(), 50);
      return;
    }
    if (field === 'icon' && value !== 'custom') {
      updated[index] = { ...updated[index], icon: value, customIcon: undefined };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setBenefits(updated);
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handlePromoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      assertFileSizeWithinUploadLimit(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
      return;
    }
    setUploadingPromo(true);
    try {
      const result = await uploadService.uploadImage(file);
      setPromoBannerState((p) => ({ ...p, imageUrl: result.url }));
      toast.success('Imagen subida');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploadingPromo(false);
    }
  };

  const handleSaveInstagramSection = async () => {
    setSavingInstagram(true);
    try {
      await configService.updateSiteConfig({
        instagramSection: {
          title: instagramSection.title ?? '',
          url: instagramSection.url ?? '',
          username: instagramSection.username ?? '',
        },
      } as any);
      await refresh();
      toast.success('Sección Instagram guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSavingInstagram(false);
    }
  };

  const handleSavePromoBanner = async () => {
    setSavingPromo(true);
    try {
      await configService.updateSiteConfig({
        promoBanner: {
          imageUrl: promoBannerState.imageUrl ?? '',
          title: promoBannerState.title ?? '',
          subtitle: promoBannerState.subtitle ?? '',
          linkUrl: promoBannerState.linkUrl ?? '',
          linkText: promoBannerState.linkText ?? '',
        },
      } as any);
      await refresh();
      toast.success('Banner promocional guardado');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSavingPromo(false);
    }
  };

  // --- Save ---

  const handleSave = async () => {
    try {
      await configService.updateSiteConfig({ heroBanner: slides, benefits } as any);
      await refresh();
      toast.success('Página de inicio actualizada');
    } catch {
      toast.error('Error al guardar');
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editar Inicio</h1>
        <button onClick={handleSave} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Guardar Cambios
        </button>
      </div>

      {/* Hero Carousel Slides */}
      <GuideSection sectionId="hero" className="mb-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Image size={20} /> Carrusel de Banners
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={addSlide} className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              <Plus size={16} /> Agregar Slide
            </button>
            <button onClick={addProductSlide} className="flex items-center gap-1 text-sm text-emerald-600 hover:underline font-medium">
              <ShoppingBag size={16} /> Agregar Slide Producto
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-1">Agregá múltiples banners que rotan automáticamente.</p>
        <p className="text-xs text-gray-500 mb-1">Escritorio: {uploadHints.heroDesktop}</p>
        <p className="text-xs text-gray-500 mb-1">Celular (opcional): {uploadHints.heroMobile}</p>
        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <GripVertical size={12} /> Arrastrá el ícono <strong>⠿</strong> para reordenar slides y botones.
        </p>

        {slides.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <Image size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm mb-3">No hay slides configurados.</p>
            <button onClick={addSlide} className="text-primary text-sm font-medium hover:underline">
              + Agregar primer slide
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {slides.map((slide, i) => {
              const h = slideDrag.getItemHandlers(i);
              const isOver = slideDrag.overIdx === i && slideDrag.dragIdx !== null && slideDrag.dragIdx !== i;
              return (
                <div
                  key={i}
                  ref={slideDrag.setItemRef(i)}
                  className={`border rounded-lg bg-gray-50 overflow-hidden transition-all ${
                    slideDrag.dragIdx === i ? 'opacity-50 scale-[0.99] shadow-lg' : ''
                  } ${isOver ? 'ring-2 ring-primary border-primary shadow-md' : ''}`}
                >
                  {/* Slide header — drag handle */}
                  <div
                    draggable
                    onDragStart={h.onDragStart}
                    onDragOver={h.onDragOver}
                    onDrop={h.onDrop}
                    onDragEnd={h.onDragEnd}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b cursor-grab active:cursor-grabbing select-none"
                  >
                    <DragGrip handlers={h} />
                    <span className="text-sm font-medium text-gray-600">
                      Slide {i + 1} de {slides.length}
                      {(slide.type === 'product') && (
                        <span className="ml-2 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Producto</span>
                      )}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => removeSlide(i)} className="p-1 text-red-400 hover:text-red-600" title="Eliminar slide">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Slide type selector */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-gray-500">Tipo de slide:</label>
                      <select
                        className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={slide.type || 'generic'}
                        onChange={(e) => {
                          const updated = [...slides];
                          const newType = e.target.value as 'generic' | 'product';
                          updated[i] = { ...updated[i], type: newType };
                          if (newType === 'generic') {
                            updated[i].productId = undefined;
                            updated[i].productSlug = undefined;
                          }
                          setSlides(updated);
                        }}
                      >
                        <option value="generic">Banner genérico</option>
                        <option value="product">Producto destacado</option>
                      </select>

                      {slide.type === 'product' && (
                        <select
                          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
                          value={slide.productId || ''}
                          onChange={(e) => selectProductForSlide(i, Number(e.target.value))}
                        >
                          <option value="">Seleccionar producto…</option>
                          {products.filter((p) => p.active).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}{p.featured ? ' ★' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Image + Text */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {slide.type === 'product' ? (
                        <div className="space-y-3">
                          {/* Product photo preview */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1.5 block">Foto del producto</label>
                            {slide.imageUrl ? (
                              <div className="h-28 rounded-lg flex items-center justify-center border" style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }}>
                                <img src={assetUrl(slide.imageUrl)} alt={slide.title} className="max-h-[80%] max-w-[60%] object-contain drop-shadow-lg" />
                              </div>
                            ) : (
                              <div className="h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-400">Seleccioná un producto para ver la foto</span>
                              </div>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">Se toma automáticamente del producto. Se muestra centrada sin recorte.</p>
                          </div>

                          {/* Background image (desktop) */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1.5 block">Fondo escritorio <span className="text-gray-400">(opcional)</span></label>
                            <p className="text-[10px] text-gray-400 mb-1">{uploadHints.heroDesktop}</p>
                            {slide.backgroundUrl ? (
                              <div className="relative group">
                                <img src={assetUrl(slide.backgroundUrl || '')} alt="Fondo" className="w-full h-24 object-cover rounded-lg border" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                                  <label className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100">
                                    Cambiar
                                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleBgImageUpload(i, e)} className="hidden" />
                                  </label>
                                  <button onClick={() => updateSlideField(i, 'backgroundUrl', '')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
                                    Quitar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                <Upload size={20} className="text-gray-400 mb-1" />
                                <span className="text-[11px] text-gray-500">{uploadingSlideIdx === i ? 'Subiendo...' : 'Subir fondo'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleBgImageUpload(i, e)} className="hidden" disabled={uploadingSlideIdx === i} />
                              </label>
                            )}
                          </div>

                          {/* Background image (mobile) */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1.5 block">Fondo celular <span className="text-gray-400">(opcional)</span></label>
                            <p className="text-[10px] text-gray-400 mb-1">{uploadHints.heroMobile}</p>
                            {slide.mobileBackgroundUrl ? (
                              <div className="relative group">
                                <img src={assetUrl(slide.mobileBackgroundUrl || '')} alt="Fondo celular" className="w-full h-24 object-cover rounded-lg border" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                                  <label className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100">
                                    Cambiar
                                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleMobileBgImageUpload(i, e)} className="hidden" />
                                  </label>
                                  <button onClick={() => updateSlideField(i, 'mobileBackgroundUrl', '')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
                                    Quitar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                <Upload size={16} className="text-gray-400 mb-0.5" />
                                <span className="text-[11px] text-gray-500">{uploadingSlideIdx === i ? 'Subiendo...' : 'Subir fondo celular'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleMobileBgImageUpload(i, e)} className="hidden" disabled={uploadingSlideIdx === i} />
                              </label>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Desktop image */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1.5 block">Imagen escritorio</label>
                            <p className="text-[10px] text-gray-400 mb-1">{uploadHints.heroDesktop}</p>
                            {slide.imageUrl ? (
                              <div className="relative group">
                                <img src={assetUrl(slide.imageUrl)} alt={`Slide ${i + 1}`} className="w-full h-28 sm:h-36 object-cover rounded-lg border" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                                  <label className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100">
                                    Cambiar
                                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleSlideImageUpload(i, e)} className="hidden" />
                                  </label>
                                  <button onClick={() => updateSlideField(i, 'imageUrl', '')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
                                    Quitar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-28 sm:h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                <Upload size={24} className="text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">{uploadingSlideIdx === i ? 'Subiendo...' : 'Subir imagen'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleSlideImageUpload(i, e)} className="hidden" disabled={uploadingSlideIdx === i} />
                              </label>
                            )}
                          </div>

                          {/* Mobile image */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1.5 block">Imagen celular <span className="text-gray-400">(opcional)</span></label>
                            <p className="text-[10px] text-gray-400 mb-1">{uploadHints.heroMobile}</p>
                            {slide.mobileImageUrl ? (
                              <div className="relative group">
                                <img src={assetUrl(slide.mobileImageUrl || '')} alt={`Slide ${i + 1} mobile`} className="w-full h-28 sm:h-36 object-cover rounded-lg border" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                                  <label className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100">
                                    Cambiar
                                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleMobileImageUpload(i, e)} className="hidden" />
                                  </label>
                                  <button onClick={() => updateSlideField(i, 'mobileImageUrl', '')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
                                    Quitar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                <Upload size={20} className="text-gray-400 mb-1" />
                                <span className="text-[11px] text-gray-500">{uploadingSlideIdx === i ? 'Subiendo...' : 'Subir imagen celular'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleMobileImageUpload(i, e)} className="hidden" disabled={uploadingSlideIdx === i} />
                              </label>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Título</label>
                          <input className={inputClass} value={slide.title} onChange={(e) => updateSlideField(i, 'title', e.target.value)} placeholder="Ej: Todo lo que buscás, en un solo lugar" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Subtítulo</label>
                          <textarea className={inputClass} rows={2} value={slide.subtitle} onChange={(e) => updateSlideField(i, 'subtitle', e.target.value)} placeholder="Ej: Expertos en tecnología..." />
                        </div>
                      </div>
                    </div>

                    {/* Layout */}
                    <LayoutSelector
                      layout={slide.layout || 'centered'}
                      onChange={(l) => updateSlideLayout(i, l)}
                    />

                    {/* Custom text */}
                    <CustomTextEditor
                      customText={slide.customText}
                      onChange={(ct) => updateSlideCustomText(i, ct)}
                    />

                    {/* Styles */}
                    <SlideStylesEditor
                      styles={slide.styles || {}}
                      onUpdate={(field, value) => updateSlideStyles(i, field, value)}
                    />

                    {/* Buttons with drag */}
                    <SlideButtonsEditor
                      slideIdx={i}
                      buttons={slide.buttons || []}
                      onUpdate={(btns) => updateSlideButtons(i, btns)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </GuideSection>

      {/* Benefits */}
      <GuideSection sectionId="benefits" className="mb-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Tarjetas de Beneficios</h2>
          <button onClick={addBenefit} className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            <Plus size={16} /> Agregar
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Las tarjetas que aparecen debajo del banner en la página de inicio.</p>

        {benefits.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">No hay beneficios configurados. Hacé clic en "Agregar" para crear uno.</p>
        ) : (
          <div className="space-y-4">
            {benefits.map((b, i) => (
              <div key={i} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex gap-4 items-start">
                  <div className="w-36 shrink-0">
                    <label className="text-xs text-gray-500 mb-1 block">Ícono</label>
                    <select
                      className={inputClass}
                      value={b.icon === 'custom' ? 'custom' : b.icon}
                      onChange={(e) => updateBenefit(i, 'icon', e.target.value)}
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

                    {b.icon === 'custom' && b.customIcon ? (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={assetUrl(b.customIcon || '')} alt="Ícono" className="w-10 h-10 rounded object-contain border bg-white" />
                        <button onClick={() => iconInputRefs.current[i]?.click()} className="text-xs text-primary hover:underline">
                          Cambiar
                        </button>
                      </div>
                    ) : b.icon === 'custom' ? (
                      <button onClick={() => iconInputRefs.current[i]?.click()} className="mt-2 text-xs text-primary hover:underline flex items-center gap-1">
                        <Upload size={12} />
                        {uploadingIconIdx === i ? 'Subiendo...' : 'Subir imagen'}
                      </button>
                    ) : null}

                    {b.icon !== 'custom' && (
                      <button onClick={() => iconInputRefs.current[i]?.click()} className="mt-2 text-xs text-gray-400 hover:text-primary hover:underline flex items-center gap-1">
                        <Upload size={12} /> Subir ícono propio
                      </button>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">{uploadHints.benefitIcon}</p>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Título</label>
                      <input className={inputClass} value={b.title} onChange={(e) => updateBenefit(i, 'title', e.target.value)} placeholder="Ej: Envío a todo el país" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                      <input className={inputClass} value={b.description} onChange={(e) => updateBenefit(i, 'description', e.target.value)} placeholder="Ej: Recibí tu pedido donde estés" />
                    </div>
                  </div>

                  <button onClick={() => removeBenefit(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-5" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </GuideSection>

      {/* Sección Instagram */}
      <GuideSection sectionId="instagram" className="mb-6">
      <div className="bg-white border rounded-lg p-6">
        <button
          type="button"
          onClick={() => setInstagramOpen(!instagramOpen)}
          className="w-full flex items-center justify-between gap-3 text-left mb-0"
        >
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <InstagramIcon size={20} className="text-pink-600" /> Sección Instagram
          </h2>
          {instagramOpen ? <ChevronUp size={22} className="text-gray-500 shrink-0" /> : <ChevronDown size={22} className="text-gray-500 shrink-0" />}
        </button>
        {instagramOpen && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <p className="text-sm text-gray-500">Configurá el bloque de Instagram en la página de inicio.</p>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título</label>
              <input
                className={inputClass}
                value={instagramSection.title ?? ''}
                onChange={(e) => setInstagramSection((s) => ({ ...s, title: e.target.value }))}
                placeholder="Ej: Seguinos en Instagram"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">URL de Instagram</label>
              <div className="flex items-center gap-2">
                <LinkIcon size={14} className="text-gray-400 shrink-0" />
                <input
                  className={inputClass}
                  value={instagramSection.url ?? ''}
                  onChange={(e) => setInstagramSection((s) => ({ ...s, url: e.target.value }))}
                  placeholder="https://instagram.com/tu_cuenta"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Usuario</label>
              <input
                className={inputClass}
                value={instagramSection.username ?? ''}
                onChange={(e) => setInstagramSection((s) => ({ ...s, username: e.target.value }))}
                placeholder="Ej: @tu_tienda"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveInstagramSection}
              disabled={savingInstagram}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {savingInstagram ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
      </GuideSection>

      {/* Banner promocional */}
      <GuideSection sectionId="promo">
      <div className="bg-white border rounded-lg p-6">
        <button
          type="button"
          onClick={() => setPromoOpen(!promoOpen)}
          className="w-full flex items-center justify-between gap-3 text-left mb-0"
        >
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Megaphone size={20} className="text-amber-600" /> Banner promocional
          </h2>
          {promoOpen ? <ChevronUp size={22} className="text-gray-500 shrink-0" /> : <ChevronDown size={22} className="text-gray-500 shrink-0" />}
        </button>
        {promoOpen && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <p className="text-sm text-gray-500">Banner destacado en inicio (imagen de fondo, textos y enlace).</p>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Imagen</label>
              <p className="text-[10px] text-gray-400 mb-1">{uploadHints.promoBanner}</p>
              {promoBannerState.imageUrl ? (
                <div className="relative group">
                  <img src={assetUrl(promoBannerState.imageUrl || '')} alt={promoBannerState.title || 'Banner'} className="w-full max-h-48 object-cover rounded-lg border" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                    <label className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100">
                      Cambiar
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePromoImageUpload} className="hidden" disabled={uploadingPromo} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setPromoBannerState((p) => ({ ...p, imageUrl: '' }))}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">{uploadingPromo ? 'Subiendo…' : 'Subir imagen'}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePromoImageUpload} className="hidden" disabled={uploadingPromo} />
                </label>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título</label>
              <input
                className={inputClass}
                value={promoBannerState.title ?? ''}
                onChange={(e) => setPromoBannerState((p) => ({ ...p, title: e.target.value }))}
                placeholder="Título del banner"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Subtítulo</label>
              <textarea
                className={inputClass}
                rows={2}
                value={promoBannerState.subtitle ?? ''}
                onChange={(e) => setPromoBannerState((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Texto secundario"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">URL del enlace</label>
              <div className="flex items-center gap-2">
                <LinkIcon size={14} className="text-gray-400 shrink-0" />
                <input
                  className={inputClass}
                  value={promoBannerState.linkUrl ?? ''}
                  onChange={(e) => setPromoBannerState((p) => ({ ...p, linkUrl: e.target.value }))}
                  placeholder="/tienda o https://..."
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Texto del enlace</label>
              <input
                className={inputClass}
                value={promoBannerState.linkText ?? ''}
                onChange={(e) => setPromoBannerState((p) => ({ ...p, linkText: e.target.value }))}
                placeholder="Ej: Ver ofertas"
              />
            </div>
            <button
              type="button"
              onClick={handleSavePromoBanner}
              disabled={savingPromo}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {savingPromo ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
      </GuideSection>
    </div>
  );
}
