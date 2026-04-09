import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import type { Product } from '../types';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';
  const [imgIdx, setImgIdx] = useState(0);
  const [adding, setAdding] = useState(false);

  const images = product.images || [];
  const currentImg = assetUrl(images[imgIdx]?.url || '');

  const discount = product.salePrice
    ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)
    : 0;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product.id);
      toast.success('Agregado al carrito');
    } catch {
      toast.error('Error al agregar');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10">
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          <div className="relative aspect-square bg-gray-100">
            {currentImg ? (
              <img src={currentImg} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingCart size={48} />
              </div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow">
                  <ChevronRight size={16} />
                </button>
              </>
            )}
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">-{discount}%</span>
            )}
          </div>

          <div className="p-6 flex flex-col">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category?.name}</p>
            <h2 className="text-xl font-bold text-gray-800 mb-3">{product.name}</h2>

            <div className="flex items-baseline gap-2 mb-4">
              {product.salePrice ? (
                <>
                  <span className="text-2xl font-bold text-primary">{currency}{Number(product.salePrice).toLocaleString()}</span>
                  <span className="text-base text-gray-400 line-through">{currency}{Number(product.price).toLocaleString()}</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">{currency}{Number(product.price).toLocaleString()}</span>
              )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-4">{product.description}</p>

            <div className="mt-auto space-y-3">
              <button
                onClick={handleAdd}
                disabled={adding || product.stock <= 0}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {product.stock <= 0 ? 'Sin stock' : adding ? 'Agregando...' : 'Agregar al carrito'}
              </button>
              <Link
                to={`/producto/${product.slug}`}
                onClick={onClose}
                className="block text-center text-sm text-primary hover:underline font-medium"
              >
                Ver detalle completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
