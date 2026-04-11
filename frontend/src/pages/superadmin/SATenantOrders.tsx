import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { superadminService } from '../../services/superadmin.service';
import type { Order } from '../../types';

const statuses = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

function customerLabel(order: Order): string {
  if (order.user) return `${order.user.name} (${order.user.email})`;
  const name = order.guestName || 'Invitado';
  const email = order.guestEmail || '-';
  return `${name} (${email})`;
}

export default function SATenantOrders() {
  const { tenantId: tenantIdParam } = useParams();
  const tenantId = Number(tenantIdParam);
  const [tenantName, setTenantName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(tenantId)) return;
    superadminService
      .getTenantById(tenantId)
      .then((t) => setTenantName(t.name))
      .catch(console.error);
  }, [tenantId]);

  const load = () => {
    if (Number.isNaN(tenantId)) return;
    setLoading(true);
    superadminService
      .getTenantOrders(tenantId, { limit: '100' })
      .then((res) => setOrders(res.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [tenantId]);

  if (Number.isNaN(tenantId)) {
    return <p className="text-red-600">ID de tienda inválido</p>;
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando pedidos...</div>;

  return (
    <div>
      <Link
        to="/super-admin/tenants"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-4"
      >
        <ChevronLeft size={16} /> Volver a tiendas
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pedidos — {tenantName || `Tienda #${tenantId}`}</h1>
      <p className="text-sm text-gray-500 mb-6">Vista de plataforma (solo lectura)</p>

      {orders.length === 0 ? (
        <p className="text-center py-8 text-gray-400">No hay pedidos en esta tienda</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = statuses.find((s) => s.value === order.status) || statuses[0];
            const expanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-white border rounded-lg overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-semibold">#{order.id}</span>
                    <span className="text-sm text-gray-500">{customerLabel(order)}</span>
                    <span className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold">${Number(order.total).toLocaleString()}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                </button>
                {expanded && (
                  <div className="border-t p-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Items</h4>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm mb-1">
                            <span>{item.product?.name} x{item.quantity}</span>
                            <span className="font-medium">
                              ${(Number(item.unitPrice) * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Envío</h4>
                        {Object.entries(order.shippingAddress || {}).map(([k, v]) => (
                          <p key={k} className="text-sm text-gray-600">
                            <span className="capitalize">{k}:</span> {String(v)}
                          </p>
                        ))}
                        <p className="text-sm text-gray-600 mt-1">Pago: {order.paymentMethod}</p>
                      </div>
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
