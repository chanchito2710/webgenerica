import { useRef, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { assertFileSizeWithinUploadLimit, uploadService } from '../../services/upload.service';
import { assetUrl } from '../../services/api';
import toast from 'react-hot-toast';

interface Props {
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  accept?: string;
  className?: string;
  previewClass?: string;
}

export default function ImageUploadZone({
  value,
  onChange,
  hint,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  className = '',
  previewClass = 'h-28',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
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
      onChange(result.url);
      toast.success('Imagen subida');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <img src={assetUrl(value)} alt="" className={`w-full object-cover rounded-lg border ${previewClass}`} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
          <label className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100">
            Cambiar
            <input type="file" accept={accept} onChange={handleFile} className="hidden" />
          </label>
          <button type="button" onClick={() => onChange('')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
            <Trash2 size={14} />
          </button>
        </div>
        {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <label className={`flex flex-col items-center justify-center ${previewClass} border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors`}>
        <Upload size={20} className="text-gray-400 mb-1" />
        <span className="text-xs text-gray-500">{uploading ? 'Subiendo...' : 'Subir imagen'}</span>
        {hint && <span className="text-[10px] text-gray-400 mt-0.5 text-center px-2">{hint}</span>}
        <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" disabled={uploading} />
      </label>
    </div>
  );
}
