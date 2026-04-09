import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, totalItems, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';
  const shippingOptions = config?.shippingOptions ?? [];
  const navigate = useNavigate();

  const [selectedShipping, setSelectedShipping] = useState<string>('');

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Explorá nuestra tienda y encontrá lo que necesitás.</p>
        <Link to="/tienda" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors inline-block">
          Ir a la Tienda
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant
      ? Number(item.product.salePrice || item.product.price) + Number(item.variant.priceAdjust)
      : Number(item.product.salePrice || item.product.price);
    return sum + price * item.quantity;
  }, 0);

  const selectedOption = shippingOptions.find((o) => o.id === selectedShipping);
  const shippingCost = selectedOption?.cost ?? 0;
  const total = subtotal + shippingCost;

  const handleCheckout = () => {
    navigate('/checkout', { state: { shippingOptionId: selectedShipping } });
  };

  const handleQuantityChange = (item: typeof items[0], index: number, newQty: number) => {
    if (user) {
      updateQuantity(item.id as number, newQty);
    } else {
      updateQuantity(index, newQty);
    }
  };

  const handleRemoveItem = (item: typeof items[0], index: number) => {
    if (user) {
      removeItem(item.id as number);
    } else {
      removeItem(index);
    }
    toast.success('Eliminado del carrito');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Carrito de compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => {
            const price = item.variant
              ? Number(item.product.salePrice || item.product.price) + Number(item.variant.priceAdjust)
              : Number(item.product.salePrice || item.product.price);

            return (
              <div key={item.id} className="flex gap-4 bg-white border rounded-lg p-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.product.images?.[0] ? (
                    <img src={assetUrl(item.product.images[0].url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/producto/${item.product.slug}`} className="font-medium text-gray-800 hover:text-primary line-clamp-1">
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>
                  )}
                  <p className="text-primary font-bold mt-1">{currency}{price.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => handleQuantityChange(item, index, item.quantity - 1)} className="p-1.5 hover:bg-gray-50">
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, index, item.quantity + 1)} className="p-1.5 hover:bg-gray-50">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item, index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => { clearCart(); toast.success('Carrito vaciado'); }}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          {/* Shipping options */}
          {shippingOptions.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Truck size={18} /> Opciones de envío
              </h3>
              <div className="space-y-2">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedShipping === option.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selectedShipping === option.id}
                      onChange={() => setSelectedShipping(option.id)}
                      className="mt-1 accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-gray-800">{option.name}</span>
                      {option.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 shrink-0">
                      {option.cost === 0 ? 'Gratis' : `${currency}${option.cost.toLocaleString()}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Order totals */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <span>{currency}{subtotal.toLocaleString()}</span>
              </div>
              {selectedOption && (
                <div className="flex justify-between text-gray-600">
                  <span>Envío ({selectedOption.name})</span>
                  <span>{shippingCost === 0 ? 'Gratis' : `${currency}${shippingCost.toLocaleString()}`}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-800">
                <span>Total</span>
                <span>{currency}{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-4 bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Finalizar Compra
            </button>

            <Link to="/tienda" className="block text-center text-sm text-primary hover:underline mt-3">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
