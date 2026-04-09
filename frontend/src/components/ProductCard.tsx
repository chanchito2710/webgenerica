import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import QuickViewModal from './QuickViewModal';
import type { Product } from '../types';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';
  const [quickView, setQuickView] = useState(false);

  const discount = product.salePrice
    ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)
    : 0;

  const imageUrl = assetUrl(product.images?.[0]?.url || '');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id);
      toast.success('Agregado al carrito');
    } catch {
      toast.error('Error al agregar al carrito');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickView(true);
  };

  return (
    <>
      <Link to={`/producto/${product.slug}`} className="group bg-white rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart size={48} />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
              Destacado
            </span>
          )}
          <button
            onClick={handleQuickView}
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Vista rápida"
          >
            <Eye size={16} />
          </button>
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.salePrice ? (
                <>
                  <span className="text-base sm:text-lg font-bold text-primary">{currency}{Number(product.salePrice).toLocaleString()}</span>
                  <span className="text-xs sm:text-sm text-gray-400 line-through">{currency}{Number(product.price).toLocaleString()}</span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-bold text-primary">{currency}{Number(product.price).toLocaleString()}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-colors"
              title="Agregar al carrito"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>

      {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
    </>
  );
}
