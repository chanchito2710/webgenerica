import { useEffect, useState } from 'react';
import { orderService } from '../../services/order.service';
import { useSiteConfig } from '../../context/SiteConfigContext';
import type { Order } from '../../types';
import toast from 'react-hot-toast';

const statuses = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrders() {
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    orderService.getAllOrders({ limit: '100' }).then((res) => setOrders(res.orders || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await orderService.updateOrderStatus(id, status);
      toast.success('Estado actualizado');
      load();
    } catch {
      toast.error('Error al actualizar');
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-center py-8 text-gray-400">No hay pedidos aún</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = statuses.find((s) => s.value === order.status) || statuses[0];
            const expanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-white border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expanded ? null : order.id)}>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">#{order.id}</span>
                    <span className="text-sm text-gray-500">{order.user?.name} ({order.user?.email})</span>
                    <span className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{currency}{Number(order.total).toLocaleString()}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                </div>
                {expanded && (
                  <div className="border-t p-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Items</h4>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm mb-1">
                            <span>{item.product?.name} x{item.quantity}</span>
                            <span className="font-medium">{currency}{(Number(item.unitPrice) * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Envío</h4>
                        {Object.entries(order.shippingAddress || {}).map(([k, v]) => (
                          <p key={k} className="text-sm text-gray-600"><span className="capitalize">{k}:</span> {String(v)}</p>
                        ))}
                        <p className="text-sm text-gray-600 mt-1">Pago: {order.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-600">Cambiar estado:</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
