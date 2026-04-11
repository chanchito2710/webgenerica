import type { SectionStyles } from '../../types';
import ImageUploadZone from './ImageUploadZone';
import ColorPickerField from './ColorPickerField';
import FontSelect from './FontSelect';

interface Props {
  styles: SectionStyles;
  onChange: (styles: SectionStyles) => void;
  showMobileBg?: boolean;
  showFonts?: boolean;
}

export default function SectionStyleEditor({ styles, onChange, showMobileBg = true, showFonts = true }: Props) {
  const update = (field: keyof SectionStyles, value: string) => {
    onChange({ ...styles, [field]: value || undefined });
  };

  return (
    <div className="border rounded-lg bg-gray-50 p-4 space-y-4">
      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Estilo de sección</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ColorPickerField
          label="Color de fondo"
          value={styles.bgColor}
          onChange={(v) => update('bgColor', v)}
          onClear={() => update('bgColor', '')}
        />
        <ColorPickerField
          label="Color de texto"
          value={styles.textColor}
          onChange={(v) => update('textColor', v)}
          onClear={() => update('textColor', '')}
        />
        <ColorPickerField
          label="Color de títulos"
          value={styles.headingColor}
          onChange={(v) => update('headingColor', v)}
          onClear={() => update('headingColor', '')}
        />
      </div>

      {showFonts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FontSelect label="Fuente de títulos" value={styles.headingFont} onChange={(v) => update('headingFont', v)} previewText="Título de ejemplo" />
          <FontSelect label="Fuente de cuerpo" value={styles.bodyFont} onChange={(v) => update('bodyFont', v)} previewText="Texto de ejemplo para esta sección." />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Imagen de fondo (escritorio)</label>
          <ImageUploadZone value={styles.bgImage || ''} onChange={(v) => update('bgImage', v)} hint="1920 × 600 px aprox. · JPG/PNG/WebP" previewClass="h-24" />
        </div>
        {showMobileBg && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Imagen de fondo (celular)</label>
            <ImageUploadZone value={styles.mobileBgImage || ''} onChange={(v) => update('mobileBgImage', v)} hint="750 × 1000 px · Vertical" previewClass="h-20" />
          </div>
        )}
      </div>
    </div>
  );
}
