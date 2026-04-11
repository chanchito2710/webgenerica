import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { superadminService } from '../../services/superadmin.service';
import type { TenantCustomer } from '../../types';

export default function SATenantCustomers() {
  const { tenantId: tenantIdParam } = useParams();
  const tenantId = Number(tenantIdParam);
  const [tenantName, setTenantName] = useState('');
  const [customers, setCustomers] = useState<TenantCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    const params: Record<string, string> = { limit: '100' };
    if (search.trim()) params.search = search.trim();
    superadminService
      .getTenantCustomers(tenantId, params)
      .then((res) => setCustomers(res.customers || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [tenantId, search]);

  if (Number.isNaN(tenantId)) {
    return <p className="text-red-600">ID de tienda inválido</p>;
  }

  return (
    <div>
      <Link
        to="/super-admin/tenants"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-4"
      >
        <ChevronLeft size={16} /> Volver a tiendas
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Clientes — {tenantName || `Tienda #${tenantId}`}</h1>
      <p className="text-sm text-gray-500 mb-4">Cuentas con rol cliente registradas en esta tienda</p>

      <div className="relative mb-4 max-w-md">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Último acceso</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Registro</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Activo</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No hay clientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
