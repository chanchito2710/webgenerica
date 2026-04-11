import { X } from 'lucide-react';

interface Props {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onClear?: () => void;
  defaultValue?: string;
}

export default function ColorPickerField({ label, value, onChange, onClear, defaultValue = '#ffffff' }: Props) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="h-8 w-10 rounded border border-gray-200 cursor-pointer shrink-0 p-0.5"
          value={value || defaultValue}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultValue}
        />
        {value && onClear && (
          <button type="button" onClick={onClear} className="text-red-500 hover:text-red-700 p-1" title="Quitar">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
