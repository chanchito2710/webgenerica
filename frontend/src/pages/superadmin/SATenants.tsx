import { useEffect, useState } from 'react';
import { Plus, Pause, Play, Trash2, ExternalLink, Search } from 'lucide-react';
import { superadminService } from '../../services/superadmin.service';
import type { Tenant } from '../../types';
import toast from 'react-hot-toast';

export default function SATenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', domain: '', plan: 'free' });

  const fetchTenants = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    superadminService.getTenants(params)
      .then((res) => setTenants(res.tenants))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTenants(); }, [search]);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Nombre es requerido'); return; }
    try {
      await superadminService.createTenant(form);
      toast.success('Tienda creada');
      setShowCreate(false);
      setForm({ name: '', slug: '', domain: '', plan: 'free' });
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear tienda');
    }
  };

  const handleSuspend = async (id: number) => {
    if (!confirm('Suspender esta tienda?')) return;
    try {
      await superadminService.suspendTenant(id);
      toast.success('Tienda suspendida');
      fetchTenants();
    } catch { toast.error('Error'); }
  };

  const handleReactivate = async (id: number) => {
    try {
      await superadminService.reactivateTenant(id);
      toast.success('Tienda reactivada');
      fetchTenants();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta tienda y TODOS sus datos? Esta acción no se puede deshacer.')) return;
    try {
      await superadminService.deleteTenant(id);
      toast.success('Tienda eliminada');
      fetchTenants();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] || 'bg-gray-100 text-gray-800'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tiendas</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          <Plus size={16} /> Nueva tienda
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Buscar por nombre, slug o dominio..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
        />
      </div>

      {showCreate && (
        <div className="bg-white border rounded-xl p-5 mb-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Crear tienda</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Slug (auto)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Dominio (ej: mitienda.com)" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Crear</button>
            <button onClick={() => setShowCreate(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tienda</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Dominio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Productos</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Pedidos</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Admins</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    {t.domain ? (
                      <a href={`https://${t.domain}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                        {t.domain} <ExternalLink size={12} />
                      </a>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3">{statusBadge(t.status)}</td>
                  <td className="px-4 py-3 text-center">{t._count?.products ?? 0}</td>
                  <td className="px-4 py-3 text-center">{t._count?.orders ?? 0}</td>
                  <td className="px-4 py-3 text-center">{t._count?.users ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {t.status === 'active' ? (
                        <button onClick={() => handleSuspend(t.id)} title="Suspender" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Pause size={16} /></button>
                      ) : (
                        <button onClick={() => handleReactivate(t.id)} title="Reactivar" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Play size={16} /></button>
                      )}
                      <button onClick={() => handleDelete(t.id)} title="Eliminar" className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No hay tiendas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
