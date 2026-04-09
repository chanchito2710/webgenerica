import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { orderService } from '../services/order.service';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Truck, Tag, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { items, localItems, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const currency = config?.currency || '$';
  const shippingOptions = config?.shippingOptions ?? [];
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const passedShippingId = (location.state as any)?.shippingOptionId || '';
  const [selectedShipping, setSelectedShipping] = useState<string>(passedShippingId);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    paymentMethod: 'transfer',
  });

  if (totalItems === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Carrito vacío</h1>
        <Link to="/tienda" className="text-primary hover:underline">Ir a la tienda</Link>
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
  const total = subtotal + shippingCost - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, cartTotal: subtotal });
      setCouponDiscount(data.discount);
      setCouponApplied(data.coupon.code);
      toast.success(`Cupón aplicado: -${currency}${data.discount.toLocaleString()}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Cupón inválido');
      setCouponDiscount(0);
      setCouponApplied('');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.address || !form.city) {
      toast.error('Completá los campos obligatorios');
      return;
    }
    if (!user && !form.email) {
      toast.error('El email es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = {
        fullName: form.fullName,
        email: form.email,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        phone: form.phone,
      };

      if (user) {
        await orderService.createOrder(shippingAddress, form.paymentMethod, selectedShipping);
        toast.success('Orden creada exitosamente');
        await clearCart();
        navigate('/mis-pedidos');
      } else {
        const guestItems = localItems.map((li) => ({
          productId: li.productId,
          variantId: li.variantId,
          quantity: li.quantity,
        }));
        const order = await orderService.createGuestOrder({
          items: guestItems,
          shippingAddress,
          shippingOptionId: selectedShipping,
          paymentMethod: form.paymentMethod,
        });
        toast.success('Orden creada exitosamente');
        await clearCart();
        navigate('/orden-confirmada', { state: { orderId: order.id } });
      }
    } catch {
      toast.error('Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Finalizar Compra</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Shipping */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos de contacto y envío</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">Nombre completo *</label>
                <input type="text" className={inputClass} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">
                  Email {!user && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required={!user}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">Dirección *</label>
                <input type="text" className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Ciudad *</label>
                <input type="text" className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Departamento / Estado</label>
                <input type="text" className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Código Postal</label>
                <input type="text" className={inputClass} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Teléfono</label>
                <input type="tel" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Shipping options */}
          {shippingOptions.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Truck size={20} /> Método de envío
              </h2>
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
                      {option.description && <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 shrink-0">
                      {option.cost === 0 ? 'Gratis' : `${currency}${option.cost.toLocaleString()}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Método de pago</h2>
            <div className="space-y-3">
              {[
                { value: 'transfer', label: 'Transferencia bancaria' },
                { value: 'cash', label: 'Efectivo al recibir' },
                { value: 'debit', label: 'Tarjeta de débito' },
                { value: 'credit', label: 'Tarjeta de crédito' },
              ].map((m) => (
                <label key={m.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${form.paymentMethod === m.value ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value={m.value} checked={form.paymentMethod === m.value} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="accent-primary" />
                  <span className="text-sm">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen del pedido</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => {
                const price = item.variant
                  ? Number(item.product.salePrice || item.product.price) + Number(item.variant.priceAdjust)
                  : Number(item.product.salePrice || item.product.price);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1">{item.product.name} x{item.quantity}</span>
                    <span className="font-medium ml-2">{currency}{(price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            {/* Coupon */}
            <div className="border-t pt-3 mb-3">
              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle size={16} />
                    <span className="font-medium">{couponApplied}</span>
                    <span className="text-green-600">-{currency}{couponDiscount.toLocaleString()}</span>
                  </div>
                  <button type="button" onClick={() => { setCouponApplied(''); setCouponDiscount(0); setCouponCode(''); }} className="text-xs text-red-500 hover:underline">Quitar</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Código de descuento"
                      className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button type="button" onClick={handleApplyCoupon} disabled={couponLoading} className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{currency}{subtotal.toLocaleString()}</span>
              </div>
              {selectedOption && (
                <div className="flex justify-between text-gray-600">
                  <span>Envío ({selectedOption.name})</span>
                  <span>{shippingCost === 0 ? 'Gratis' : `${currency}${shippingCost.toLocaleString()}`}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({couponApplied})</span>
                  <span>-{currency}{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{currency}{Math.max(0, total).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">Método de pago: {form.paymentMethod === 'transfer' ? 'Transferencia' : form.paymentMethod === 'cash' ? 'Efectivo' : form.paymentMethod === 'debit' ? 'Débito' : 'Crédito'}</p>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? 'Procesando...' : 'Confirmar Orden'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
