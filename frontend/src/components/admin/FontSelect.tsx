import { FONT_OPTIONS, loadGoogleFont } from '../../utils/fonts';

interface Props {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  showPreview?: boolean;
  previewText?: string;
}

export default function FontSelect({
  label,
  value,
  onChange,
  showPreview = true,
  previewText = 'Vista previa del texto',
}: Props) {
  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <select
        className={inputClass}
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value) loadGoogleFont(e.target.value);
        }}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      {showPreview && value && (
        <p className="mt-1.5 text-sm text-gray-700" style={{ fontFamily: `"${value}", sans-serif` }}>
          {previewText}
        </p>
      )}
    </div>
  );
}
