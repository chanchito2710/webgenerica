import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Plus, Check, Paintbrush } from 'lucide-react';
import { FONT_OPTIONS, ensureSlideFonts } from '../utils/fonts';
import { assetUrl } from '../services/api';
import type { HeroSlide, HeroButton, SlideStyles, SlideLayout, SlideCustomText } from '../types';

interface Props {
  slides: HeroSlide[];
  autoPlayMs?: number;
  onSlidesChange?: (slides: HeroSlide[]) => void;
}

const DEFAULT_BUTTONS: HeroButton[] = [
  { text: 'Ver Productos', url: '/tienda', style: 'primary' },
  { text: 'Servicio Técnico', url: '/servicio-tecnico', style: 'primary' },
  { text: 'Contacto', url: '/contacto', style: 'outline' },
];

const btnStyleClasses: Record<HeroButton['style'], string> = {
  primary: 'bg-white text-primary font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base',
  outline: 'border-2 border-white text-white font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-white/10 transition-colors text-sm sm:text-base',
};

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

function overlayBackground(styles?: SlideStyles): { style?: React.CSSProperties; className: string } {
  if (styles?.overlayColor) {
    const opacity = styles.overlayOpacity ?? 50;
    return {
      style: { background: hexToRgba(styles.overlayColor, opacity) },
      className: '',
    };
  }
  return { className: 'bg-gradient-to-t from-black/60 via-black/30 to-transparent' };
}

function btnInlineStyle(btn: HeroButton, buttonFont?: string): React.CSSProperties | undefined {
  const hasCustom = btn.bgColor || btn.textColor || btn.borderColor || buttonFont;
  if (!hasCustom) return undefined;
  return {
    ...(btn.bgColor ? { backgroundColor: btn.bgColor } : {}),
    ...(btn.textColor ? { color: btn.textColor } : {}),
    ...(btn.borderColor ? { borderColor: btn.borderColor } : {}),
    ...(buttonFont ? { fontFamily: buttonFont } : {}),
  };
}

/* ─── Layout presets ─── */

const LAYOUT_CLASSES: Record<SlideLayout, { container: string; btnAlign: string }> = {
  centered:        { container: 'flex flex-col items-center justify-center text-center px-4 sm:px-8', btnAlign: 'justify-center' },
  left:            { container: 'flex flex-col items-start justify-center text-left px-6 sm:px-12 lg:px-20', btnAlign: 'justify-start' },
  right:           { container: 'flex flex-col items-end justify-center text-right px-6 sm:px-12 lg:px-20', btnAlign: 'justify-end' },
  'bottom-left':   { container: 'flex flex-col items-start justify-end text-left px-6 sm:px-12 lg:px-20 pb-10 sm:pb-14', btnAlign: 'justify-start' },
  'bottom-center': { container: 'flex flex-col items-center justify-end text-center px-4 sm:px-8 pb-10 sm:pb-14', btnAlign: 'justify-center' },
  'top-left':      { container: 'flex flex-col items-start justify-start text-left px-6 sm:px-12 lg:px-20 pt-10 sm:pt-14', btnAlign: 'justify-start' },
};

const LAYOUT_OPTIONS: { value: SlideLayout; label: string }[] = [
  { value: 'centered', label: 'Centrado' },
  { value: 'left', label: 'Izquierda' },
  { value: 'right', label: 'Derecha' },
  { value: 'bottom-left', label: 'Inf. izq.' },
  { value: 'bottom-center', label: 'Inf. centro' },
  { value: 'top-left', label: 'Sup. izq.' },
];

const FONT_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-xs sm:text-sm',
  base: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg md:text-xl',
  xl: 'text-lg sm:text-xl md:text-2xl',
};

const FONT_WEIGHT_CLASSES: Record<string, string> = {
  normal: 'font-normal',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

/* ─── Custom text badge ─── */

function CustomTextElement({ ct }: { ct: SlideCustomText }) {
  if (!ct.text) return null;
  return (
    <span
      className={`inline-block rounded-md px-3 py-1.5 drop-shadow ${FONT_SIZE_CLASSES[ct.fontSize || 'base']} ${FONT_WEIGHT_CLASSES[ct.fontWeight || 'normal']}`}
      style={{
        fontFamily: ct.font || undefined,
        color: ct.color || '#ffffff',
        backgroundColor: ct.bgColor || undefined,
      }}
    >
      {ct.text}
    </span>
  );
}

/* ─── Render a single button (read-only) ─── */

function RenderButton({ btn, buttonFont }: { btn: HeroButton; buttonFont?: string }) {
  const cls = btnStyleClasses[btn.style] || btnStyleClasses.primary;
  const inlineStyle = btnInlineStyle(btn, buttonFont);
  return isExternal(btn.url) ? (
    <a href={btn.url} target="_blank" rel="noopener noreferrer" className={cls} style={inlineStyle}>{btn.text}</a>
  ) : (
    <Link to={btn.url} className={cls} style={inlineStyle}>{btn.text}</Link>
  );
}

/* ─── Button edit popover ─── */

function ButtonPopover({
  btn,
  onUpdate,
  onClose,
}: {
  btn: HeroButton;
  onUpdate: (field: keyof HeroButton, value: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showColors, setShowColors] = useState(!!(btn.bgColor || btn.textColor || btn.borderColor));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const inputCls = 'w-full border rounded-lg px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-2xl border p-3 z-[60] w-64 sm:w-72 max-h-[70vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="space-y-2.5">
        <div>
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Texto</label>
          <input className={inputCls} value={btn.text} onChange={(e) => onUpdate('text', e.target.value)} placeholder="Texto del botón" autoFocus />
        </div>
        <div>
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">URL</label>
          <input className={inputCls} value={btn.url} onChange={(e) => onUpdate('url', e.target.value)} placeholder="/tienda o https://..." />
        </div>
        <div>
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Estilo</label>
          <select className={inputCls} value={btn.style} onChange={(e) => onUpdate('style', e.target.value)}>
            <option value="primary">Relleno (blanco)</option>
            <option value="outline">Borde (transparente)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowColors(!showColors)}
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
        >
          <Paintbrush size={12} /> {showColors ? 'Ocultar colores' : 'Colores personalizados'}
        </button>

        {showColors && (
          <div className="space-y-2 border-t pt-2">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide w-16 shrink-0">Fondo</label>
              <input type="color" value={btn.bgColor || '#ffffff'} onChange={(e) => onUpdate('bgColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
              {btn.bgColor && (
                <button onClick={() => onUpdate('bgColor', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide w-16 shrink-0">Texto</label>
              <input type="color" value={btn.textColor || '#2563eb'} onChange={(e) => onUpdate('textColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
              {btn.textColor && (
                <button onClick={() => onUpdate('textColor', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide w-16 shrink-0">Borde</label>
              <input type="color" value={btn.borderColor || '#ffffff'} onChange={(e) => onUpdate('borderColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
              {btn.borderColor && (
                <button onClick={() => onUpdate('borderColor', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-primary text-white text-sm font-medium py-1.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
        >
          <Check size={14} /> Listo
        </button>
      </div>
    </div>
  );
}

/* ─── Inline text editor ─── */

function InlineTextEditor({
  value,
  onSave,
  onClose,
  multiline,
}: {
  value: string;
  onSave: (v: string) => void;
  onClose: () => void;
  multiline?: boolean;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onSave(text);
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [text, onSave, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      onSave(text);
      onClose();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div ref={ref} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-2xl border p-3 z-[60] w-72 sm:w-96" onPointerDown={(e) => e.stopPropagation()}>
      {multiline ? (
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      )}
      <button
        onClick={() => { onSave(text); onClose(); }}
        className="mt-2 w-full bg-primary text-white text-sm font-medium py-1.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
      >
        <Check size={14} /> Listo
      </button>
    </div>
  );
}

/* ─── Styles panel (floating, admin mode) ─── */

function StylesPanel({
  styles,
  onStylesChange,
  onClose,
}: {
  styles: SlideStyles;
  onStylesChange: (s: SlideStyles) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const update = (field: keyof SlideStyles, value: string | number) => {
    const v = value === '' ? undefined : value;
    onStylesChange({ ...styles, [field]: v });
  };

  const selectCls = 'w-full border rounded px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div
      ref={ref}
      className="absolute top-12 right-4 z-[70] bg-white rounded-xl shadow-2xl border p-3 w-64 max-h-[60vh] overflow-y-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Estilos del slide</h3>

      <div className="mb-3">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block mb-1">Fuente título</label>
        <select className={selectCls} value={styles.titleFont || ''} onChange={(e) => update('titleFont', e.target.value)}>
          {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <div className="flex items-center gap-2 mt-1.5">
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide shrink-0">Color</label>
          <input type="color" value={styles.titleColor || '#ffffff'} onChange={(e) => update('titleColor', e.target.value)} className="w-7 h-7 rounded border cursor-pointer" />
          {styles.titleColor && (
            <button onClick={() => update('titleColor', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block mb-1">Fuente subtítulo</label>
        <select className={selectCls} value={styles.subtitleFont || ''} onChange={(e) => update('subtitleFont', e.target.value)}>
          {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <div className="flex items-center gap-2 mt-1.5">
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide shrink-0">Color</label>
          <input type="color" value={styles.subtitleColor || '#ffffff'} onChange={(e) => update('subtitleColor', e.target.value)} className="w-7 h-7 rounded border cursor-pointer" />
          {styles.subtitleColor && (
            <button onClick={() => update('subtitleColor', '')} className="text-[10px] text-red-500 hover:underline">Quitar</button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block mb-1">Fuente botones</label>
        <select className={selectCls} value={styles.buttonFont || ''} onChange={(e) => update('buttonFont', e.target.value)}>
          {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      <div className="border-t pt-2">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block mb-1">Fondo overlay</label>
        <div className="flex items-center gap-2">
          <input type="color" value={styles.overlayColor || '#000000'} onChange={(e) => update('overlayColor', e.target.value)} className="w-7 h-7 rounded border cursor-pointer" />
          <span className="text-[10px] text-gray-500">{styles.overlayColor || 'Degradado'}</span>
          {styles.overlayColor && (
            <button onClick={() => { update('overlayColor', ''); update('overlayOpacity', ''); }} className="text-[10px] text-red-500 hover:underline ml-auto">Quitar</button>
          )}
        </div>
        {styles.overlayColor && (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Opacidad</label>
              <span className="text-[10px] text-gray-600 font-medium">{styles.overlayOpacity ?? 50}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={styles.overlayOpacity ?? 50}
              onChange={(e) => update('overlayOpacity', Number(e.target.value))}
              className="w-full mt-1 accent-primary"
            />
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="mt-3 w-full bg-primary text-white text-xs font-medium py-1.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
      >
        <Check size={12} /> Listo
      </button>
    </div>
  );
}

/* ─── Layout overlay (public, read-only) ─── */

function LayoutOverlay({
  slide,
  buttons,
  current,
}: {
  slide: HeroSlide;
  buttons: HeroButton[];
  current: number;
}) {
  const styles = slide.styles || {};
  const layout = slide.layout || 'centered';
  const lc = LAYOUT_CLASSES[layout] || LAYOUT_CLASSES.centered;

  useEffect(() => {
    ensureSlideFonts(styles, slide.customText?.font);
  }, [styles, slide.customText?.font]);

  const overlay = overlayBackground(styles);

  return (
    <div
      className={`absolute inset-0 z-[2] ${lc.container} gap-2 sm:gap-4 ${overlay.className}`}
      style={overlay.style}
    >
      {slide.title && (
        <h1
          key={`t-${current}`}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg animate-fade-in max-w-4xl"
          style={{
            fontFamily: styles.titleFont || undefined,
            color: styles.titleColor || '#ffffff',
          }}
        >
          {slide.title}
        </h1>
      )}
      {slide.subtitle && (
        <p
          key={`s-${current}`}
          className="text-sm sm:text-lg md:text-xl drop-shadow animate-fade-in max-w-2xl"
          style={{
            fontFamily: styles.subtitleFont || undefined,
            color: styles.subtitleColor || 'rgba(255,255,255,0.9)',
          }}
        >
          {slide.subtitle}
        </p>
      )}
      {slide.customText?.text && <CustomTextElement ct={slide.customText} />}
      {buttons.length > 0 && (
        <div className={`flex flex-wrap gap-3 sm:gap-4 mt-1 sm:mt-2 ${lc.btnAlign}`}>
          {buttons.map((btn, j) => (
            <RenderButton key={j} btn={btn} buttonFont={styles.buttonFont} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Admin overlay (editable, no drag) ─── */

function AdminOverlay({
  slide,
  slideIdx,
  buttons,
  onSlideChange,
}: {
  slide: HeroSlide;
  slideIdx: number;
  buttons: HeroButton[];
  onSlideChange: (updated: Partial<HeroSlide>) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editBtnIdx, setEditBtnIdx] = useState<number | null>(null);
  const [showStyles, setShowStyles] = useState(false);

  const styles = slide.styles || {};
  const layout = slide.layout || 'centered';
  const lc = LAYOUT_CLASSES[layout] || LAYOUT_CLASSES.centered;

  useEffect(() => {
    ensureSlideFonts(styles, slide.customText?.font);
  }, [styles, slide.customText?.font]);

  const overlay = overlayBackground(styles);

  const updateButton = (idx: number, field: keyof HeroButton, value: string) => {
    const updated = [...buttons];
    updated[idx] = { ...updated[idx], [field]: value };
    onSlideChange({ buttons: updated });
  };

  const removeButton = (idx: number) => {
    onSlideChange({ buttons: buttons.filter((_, i) => i !== idx) });
    if (editBtnIdx === idx) setEditBtnIdx(null);
  };

  const addButton = () => {
    onSlideChange({ buttons: [...buttons, { text: 'Nuevo', url: '/', style: 'primary' as const }] });
  };

  const handleStylesChange = (s: SlideStyles) => {
    ensureSlideFonts(s);
    onSlideChange({ styles: s });
  };

  return (
    <div className={`absolute inset-0 z-[2] ${overlay.className}`} style={overlay.style}>
      {/* Floating toolbar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-1.5 max-w-[95%]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
            Modo edición
          </span>
          <button
            onClick={() => setShowStyles(!showStyles)}
            className="text-[10px] text-white/70 bg-black/40 hover:bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <Paintbrush size={10} /> Estilos
          </button>
        </div>
        {/* Layout picker */}
        <div className="flex gap-1 flex-wrap justify-center">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSlideChange({ layout: opt.value })}
              className={`text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm transition-colors ${
                layout === opt.value
                  ? 'bg-white/40 text-white font-semibold'
                  : 'bg-black/30 text-white/60 hover:bg-black/50 hover:text-white/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showStyles && (
        <StylesPanel
          styles={styles}
          onStylesChange={handleStylesChange}
          onClose={() => setShowStyles(false)}
        />
      )}

      {/* Content area with chosen layout */}
      <div className={`absolute inset-0 ${lc.container} gap-2 sm:gap-3 pt-16 sm:pt-14`}>
        {/* Title */}
        <div
          className="relative cursor-pointer rounded-lg transition-all hover:ring-2 hover:ring-white/50 hover:ring-dashed p-1"
          onClick={() => setEditingTitle(true)}
        >
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg max-w-4xl"
            style={{
              fontFamily: styles.titleFont || undefined,
              color: styles.titleColor || '#ffffff',
            }}
          >
            {slide.title || '(clic para editar título)'}
          </h1>
          {editingTitle && (
            <InlineTextEditor
              value={slide.title}
              onSave={(v) => onSlideChange({ title: v })}
              onClose={() => setEditingTitle(false)}
            />
          )}
        </div>

        {/* Subtitle */}
        <div
          className="relative cursor-pointer rounded-lg transition-all hover:ring-2 hover:ring-white/50 hover:ring-dashed p-1"
          onClick={() => setEditingSubtitle(true)}
        >
          <p
            className="text-sm sm:text-lg md:text-xl drop-shadow max-w-2xl"
            style={{
              fontFamily: styles.subtitleFont || undefined,
              color: styles.subtitleColor || 'rgba(255,255,255,0.9)',
            }}
          >
            {slide.subtitle || '(clic para editar subtítulo)'}
          </p>
          {editingSubtitle && (
            <InlineTextEditor
              value={slide.subtitle}
              onSave={(v) => onSlideChange({ subtitle: v })}
              onClose={() => setEditingSubtitle(false)}
              multiline
            />
          )}
        </div>

        {/* Custom text */}
        {slide.customText?.text && <CustomTextElement ct={slide.customText} />}

        {/* Buttons */}
        <div className={`flex flex-wrap gap-3 sm:gap-4 mt-1 sm:mt-2 ${lc.btnAlign}`}>
          {buttons.map((btn, j) => {
            const inlineStyle = btnInlineStyle(btn, styles.buttonFont);
            return (
              <div key={`btn-${slideIdx}-${j}`} className="relative group">
                <button
                  onClick={(e) => { e.stopPropagation(); removeButton(j); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 z-20 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                >
                  <X size={12} />
                </button>
                <div
                  className={`${btnStyleClasses[btn.style] || btnStyleClasses.primary} cursor-pointer hover:ring-2 hover:ring-white/50 hover:ring-dashed`}
                  style={inlineStyle}
                  onClick={() => setEditBtnIdx(editBtnIdx === j ? null : j)}
                >
                  {btn.text || '(botón)'}
                </div>
                {editBtnIdx === j && (
                  <ButtonPopover
                    btn={btn}
                    onUpdate={(field, value) => updateButton(j, field, value)}
                    onClose={() => setEditBtnIdx(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={addButton}
        className="absolute bottom-4 right-4 z-[60] bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
      >
        <Plus size={14} /> Agregar botón
      </button>
    </div>
  );
}

/* ─── Main carousel ─── */

export default function HeroCarousel({ slides, autoPlayMs = 5000, onSlidesChange }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const len = slides.length;
  const isEditable = !!onSlidesChange;

  const next = useCallback(() => setCurrent((c) => (c + 1) % len), [len]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + len) % len), [len]);

  useEffect(() => {
    if (paused || len <= 1) return;
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [paused, next, autoPlayMs, len]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchDeltaX.current > 50) prev();
    else if (touchDeltaX.current < -50) next();
  };

  const defaultSlide: HeroSlide = {
    imageUrl: '',
    title: 'Todo lo que buscás, en un solo lugar',
    subtitle: 'Expertos en tecnología. Los mejores productos con la mejor atención.',
    buttons: DEFAULT_BUTTONS,
  };

  const effectiveSlides = len > 0 ? slides : [defaultSlide];
  const effectiveLen = effectiveSlides.length;
  const slideIdx = current % effectiveLen;
  const slide = effectiveSlides[slideIdx];
  const slideButtons = slide.buttons && slide.buttons.length > 0 ? slide.buttons : DEFAULT_BUTTONS;

  const handleSlideFieldChange = useCallback(
    (partial: Partial<HeroSlide>) => {
      if (!onSlidesChange) return;
      const updated = [...slides];
      updated[slideIdx] = { ...updated[slideIdx], ...partial };
      if (partial.styles !== undefined) {
        updated[slideIdx].styles = partial.styles;
      }
      if (partial.customText !== undefined) {
        updated[slideIdx].customText = partial.customText;
      }
      onSlidesChange(updated);
    },
    [onSlidesChange, slides, slideIdx],
  );

  const renderOverlay = () => {
    if (isEditable) {
      return (
        <AdminOverlay
          slide={slide}
          slideIdx={slideIdx}
          buttons={slideButtons}
          onSlideChange={handleSlideFieldChange}
        />
      );
    }
    return <LayoutOverlay slide={slide} buttons={slideButtons} current={current} />;
  };

  if (slide.imageUrl) {
    return (
      <section
        className="relative overflow-hidden select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={!isEditable ? handleTouchStart : undefined}
        onTouchMove={!isEditable ? handleTouchMove : undefined}
        onTouchEnd={!isEditable ? handleTouchEnd : undefined}
      >
        <div className="relative h-[260px] sm:h-[360px] md:h-[440px] lg:h-[520px]">
          {effectiveSlides.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === slideIdx ? 1 : 0, zIndex: i === slideIdx ? 1 : 0 }}
            >
              {s.type === 'product' ? (
                <div className="w-full h-full relative">
                  {s.backgroundUrl ? (
                    <>
                      {s.mobileBackgroundUrl && (
                        <img
                          src={assetUrl(s.mobileBackgroundUrl!)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover sm:hidden"
                          loading={i === 0 ? 'eager' : 'lazy'}
                        />
                      )}
                      <img
                        src={assetUrl(s.backgroundUrl!)}
                        alt=""
                        className={`absolute inset-0 w-full h-full object-cover ${s.mobileBackgroundUrl ? 'hidden sm:block' : ''}`}
                        loading={i === 0 ? 'eager' : 'lazy'}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gray-100" />
                  )}
                  {s.imageUrl && (
                    <img
                      src={assetUrl(s.imageUrl)}
                      alt={s.title || `Slide ${i + 1}`}
                      className="absolute inset-0 m-auto max-h-[75%] max-w-[65%] sm:max-w-[45%] object-contain drop-shadow-2xl z-[1]"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  )}
                </div>
              ) : s.mobileImageUrl ? (
                <>
                  <img
                    src={assetUrl(s.mobileImageUrl)}
                    alt={s.title || `Slide ${i + 1}`}
                    className="w-full h-full object-cover sm:hidden"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                  <img
                    src={assetUrl(s.imageUrl)}
                    alt={s.title || `Slide ${i + 1}`}
                    className="w-full h-full object-cover hidden sm:block"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </>
              ) : (
                <img
                  src={assetUrl(s.imageUrl)}
                  alt={s.title || `Slide ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          ))}

          {renderOverlay()}
        </div>

        {effectiveLen > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 sm:p-2 backdrop-blur-sm transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 sm:p-2 backdrop-blur-sm transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {effectiveLen > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {effectiveSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slideIdx
                    ? 'bg-white w-8 h-2.5 sm:h-3'
                    : 'bg-white/50 hover:bg-white/70 w-2.5 h-2.5 sm:w-3 sm:h-3'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Fallback gradient (no image)
  const fallbackLayout = slide.layout || 'centered';
  const fallbackLc = LAYOUT_CLASSES[fallbackLayout] || LAYOUT_CLASSES.centered;

  return (
    <section className="bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="relative min-h-[300px] sm:min-h-[400px]">
        {isEditable ? (
          <AdminOverlay
            slide={slide}
            slideIdx={slideIdx}
            buttons={slideButtons}
            onSlideChange={handleSlideFieldChange}
          />
        ) : (
          <div className={`${fallbackLc.container} gap-3 sm:gap-4 min-h-[300px] sm:min-h-[400px]`}>
            <h1
              className="text-2xl sm:text-4xl md:text-5xl font-bold"
              style={{
                fontFamily: slide.styles?.titleFont || undefined,
                color: slide.styles?.titleColor || undefined,
              }}
            >
              {slide.title || 'Todo lo que buscás, en un solo lugar'}
            </h1>
            <p
              className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl"
              style={{
                fontFamily: slide.styles?.subtitleFont || undefined,
                color: slide.styles?.subtitleColor || undefined,
              }}
            >
              {slide.subtitle || 'Expertos en tecnología. Los mejores productos con la mejor atención.'}
            </p>
            {slide.customText?.text && <CustomTextElement ct={slide.customText} />}
            <div className={`flex flex-wrap gap-3 sm:gap-4 ${fallbackLc.btnAlign}`}>
              {slideButtons.map((btn, j) => (
                <RenderButton key={j} btn={btn} buttonFont={slide.styles?.buttonFont} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
