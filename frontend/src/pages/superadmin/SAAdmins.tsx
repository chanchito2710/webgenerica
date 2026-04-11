import { useEffect, useState } from 'react';
import { Plus, Pause, Play, Trash2, Mail, Search, UserCheck, UserX } from 'lucide-react';
import { superadminService } from '../../services/superadmin.service';
import type { AdminUser, Tenant } from '../../types';
import toast from 'react-hot-toast';

export default function SAAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', tenantId: '', activeImmediately: false });
  const [revealedPassword, setRevealedPassword] = useState<{ email: string; password: string } | null>(null);

  const fetchAdmins = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    superadminService.getAdmins(params)
      .then((res) => setAdmins(res.admins))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, [search]);

  useEffect(() => {
    superadminService.getTenants({ limit: '200' }).then((res) => setTenants(res.tenants)).catch(console.error);
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.tenantId) { toast.error('Todos los campos son requeridos'); return; }
    try {
      const res = await superadminService.createAdmin({
        name: form.name,
        email: form.email,
        tenantId: Number(form.tenantId),
        activeImmediately: form.activeImmediately,
      });
      if (form.activeImmediately && res.tempPassword) {
        toast.success('Admin creado y activado.');
        setRevealedPassword({ email: res.email, password: res.tempPassword });
      } else if (form.activeImmediately && !res.tempPassword) {
        toast.error('El servidor no devolvió contraseña. ¿Desplegaste el último backend con "activeImmediately"?');
      } else {
        toast.success('Admin creado. Email de activación enviado (si SMTP está configurado).');
      }
      setShowCreate(false);
      setForm({ name: '', email: '', tenantId: '', activeImmediately: false });
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear admin');
    }
  };

  const handleSuspend = async (id: number) => {
    const reason = prompt('Motivo de suspensión (opcional):') ?? '';
    try {
      await superadminService.suspendAdmin(id, reason);
      toast.success('Admin suspendido');
      fetchAdmins();
    } catch { toast.error('Error'); }
  };

  const handleReactivate = async (id: number) => {
    try {
      await superadminService.reactivateAdmin(id);
      toast.success('Admin reactivado');
      fetchAdmins();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este administrador?')) return;
    try {
      await superadminService.deleteAdmin(id);
      toast.success('Admin eliminado');
      fetchAdmins();
    } catch { toast.error('Error'); }
  };

  const handleResendActivation = async (id: number) => {
    try {
      await superadminService.resendActivation(id);
      toast.success('Email de activación reenviado');
    } catch { toast.error('Error'); }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('es') : '-';

  const copyPassword = () => {
    if (!revealedPassword) return;
    void navigator.clipboard.writeText(revealedPassword.password);
    toast.success('Contraseña copiada al portapapeles');
  };

  return (
    <div>
      {revealedPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="pwd-modal-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border-2 border-indigo-200">
            <h2 id="pwd-modal-title" className="text-lg font-bold text-gray-900 mb-2">Contraseña temporal</h2>
            <p className="text-sm text-gray-600 mb-4">
              Guardala ahora: <strong>no se volverá a mostrar</strong>. Compartila con <strong>{revealedPassword.email}</strong> por un canal seguro.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <code className="flex-1 break-all text-sm bg-gray-100 border rounded-lg px-3 py-2 font-mono text-gray-900 select-all">
                {revealedPassword.password}
              </code>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyPassword} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Copiar contraseña
              </button>
              <button
                type="button"
                onClick={() => setRevealedPassword(null)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Administradores</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          <Plus size={16} /> Nuevo admin
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Buscar por nombre o email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
        />
      </div>

      {showCreate && (
        <div className="bg-white border rounded-xl p-5 mb-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Crear administrador</h2>
          <p className="text-xs text-gray-500">
            {form.activeImmediately
              ? 'La cuenta quedará activa al instante. Se mostrará la contraseña temporal una sola vez (sin email).'
              : 'Se intentará enviar un email con contraseña temporal y enlace de activación (requiere SMTP en el servidor).'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <select value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar tienda *</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.activeImmediately}
              onChange={(e) => setForm({ ...form, activeImmediately: e.target.checked })}
              className="rounded border-gray-300"
            />
            Activar ya (sin email; mostrar contraseña temporal aquí)
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
              {form.activeImmediately ? 'Crear admin activo' : 'Crear y enviar email'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">Cancelar</button>
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
                <th className="text-left px-4 py-3 font-medium text-gray-500">Admin</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tienda</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Último login</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Creado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.tenant?.name || '-'}</td>
                  <td className="px-4 py-3">
                    {a.suspendedAt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><UserX size={12} /> Suspendido</span>
                    ) : a.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><UserCheck size={12} /> Activo</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(a.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(a.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!a.isActive && (
                        <button onClick={() => handleResendActivation(a.id)} title="Reenviar activación" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Mail size={16} /></button>
                      )}
                      {a.suspendedAt ? (
                        <button onClick={() => handleReactivate(a.id)} title="Reactivar" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Play size={16} /></button>
                      ) : (
                        <button onClick={() => handleSuspend(a.id)} title="Suspender" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Pause size={16} /></button>
                      )}
                      <button onClick={() => handleDelete(a.id)} title="Eliminar" className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay administradores</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
