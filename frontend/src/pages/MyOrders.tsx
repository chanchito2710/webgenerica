import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { orderService } from '../services/order.service';
import { useSiteConfig } from '../context/SiteConfigContext';
import type { Order } from '../types';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No tenés pedidos aún.</p>
          <Link to="/tienda" className="text-primary hover:underline font-medium">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = statusLabels[order.status] || statusLabels.pending;
            return (
              <div key={order.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-gray-800">Orden #{order.id}</span>
                    <span className="text-sm text-gray-500 ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="space-y-2 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product?.name} x{item.quantity}</span>
                      <span className="font-medium">{currency}{(Number(item.unitPrice) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-sm text-gray-500">Pago: {order.paymentMethod}</span>
                  <span className="font-bold text-primary">{currency}{Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
