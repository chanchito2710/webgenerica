import { useEffect, useState } from 'react';
import { Store, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { superadminService } from '../../services/superadmin.service';
import type { PlatformStats } from '../../types';

export default function SADashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superadminService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Cargando...</div>;

  const cards = [
    { label: 'Tiendas', value: stats?.tenants ?? 0, icon: Store, color: 'bg-blue-500' },
    { label: 'Administradores', value: stats?.admins ?? 0, icon: Users, color: 'bg-green-500' },
    { label: 'Pedidos totales', value: stats?.orders ?? 0, icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Ingresos totales', value: `$${(stats?.revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard - Plataforma</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className={`${c.color} p-3 rounded-lg text-white`}>
                <c.icon size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
