import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ShoppingCart } from 'lucide-react';
import { productService } from '../services/product.service';
import { assetUrl } from '../services/api';
import { useSiteConfig } from '../context/SiteConfigContext';
import type { Product } from '../types';

interface Props {
  onClose: () => void;
}

export default function LiveSearch({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await productService.getProducts({ search: query.trim(), limit: '5' });
        setResults(res.products || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/tienda?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="mt-3 relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm">
          Buscar
        </button>
      </form>

      {query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">Buscando...</div>
          ) : results.length > 0 ? (
            <>
              {results.map((p) => {
                const imgUrl = assetUrl(p.images?.[0]?.url || '');
                return (
                  <Link
                    key={p.id}
                    to={`/producto/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingCart size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.category?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {p.salePrice ? (
                        <>
                          <p className="text-sm font-bold text-primary">{currency}{Number(p.salePrice).toLocaleString()}</p>
                          <p className="text-xs text-gray-400 line-through">{currency}{Number(p.price).toLocaleString()}</p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-primary">{currency}{Number(p.price).toLocaleString()}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
              <Link to={`/tienda?search=${encodeURIComponent(query)}`} onClick={onClose} className="block text-center text-sm text-primary font-medium py-3 hover:bg-gray-50 transition-colors">
                Ver todos los resultados
              </Link>
            </>
          ) : (
            <div className="p-4 text-center text-gray-400 text-sm">No se encontraron productos</div>
          )}
        </div>
      )}
    </div>
  );
}
