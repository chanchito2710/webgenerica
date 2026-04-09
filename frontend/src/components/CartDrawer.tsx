import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import type { CartItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { items, resolvedItems, totalItems, updateQuantity, removeItem } = useCart();
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';

  const cartItems: CartItem[] = items.length > 0 ? items : resolvedItems;

  const total = cartItems.reduce((sum, item) => {
    const price = item.product?.salePrice ?? item.product?.price ?? 0;
    return sum + Number(price) * item.quantity;
  }, 0);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[61] shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag size={20} /> Carrito ({totalItems})
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-4">
            <ShoppingBag size={48} className="mb-3" />
            <p className="text-sm mb-4">Tu carrito está vacío</p>
            <Link to="/tienda" onClick={onClose} className="text-primary hover:underline text-sm font-medium">
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.map((item) => {
                const imgUrl = assetUrl(item.product?.images?.[0]?.url || '');
                const price = item.product?.salePrice ?? item.product?.price ?? 0;
                return (
                  <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>}
                      <p className="text-sm font-bold text-primary mt-1">{currency}{Number(price).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button onClick={() => removeItem(item.id as number)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      <div className="flex items-center gap-1 bg-white border rounded-lg">
                        <button onClick={() => updateQuantity(item.id as number, item.quantity - 1)} className="p-1 hover:bg-gray-50 rounded-l-lg">
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id as number, item.quantity + 1)} className="p-1 hover:bg-gray-50 rounded-r-lg">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span>{currency}{total.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/carrito" onClick={onClose} className="text-center border-2 border-primary text-primary font-semibold py-2.5 rounded-lg hover:bg-primary/5 transition-colors text-sm">
                  Ver carrito
                </Link>
                <Link to="/checkout" onClick={onClose} className="text-center bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm">
                  Finalizar compra
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
