import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Coupon {
  id: number;
  code: string;
  type: string;
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
}

const emptyForm = { code: '', type: 'percentage', value: 0, minPurchase: 0, maxUses: 0, expiresAt: '', active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await api.get('/coupons');
    setCoupons(data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/coupons/${editingId}`, form);
        toast.success('Cupón actualizado');
      } else {
        await api.post('/coupons', form);
        toast.success('Cupón creado');
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error');
    }
  };

  const handleEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minPurchase: c.minPurchase,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      active: c.active,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    await api.delete(`/coupons/${id}`);
    toast.success('Eliminado');
    load();
  };

  const toggleActive = async (c: Coupon) => {
    await api.put(`/coupons/${c.id}`, { active: !c.active });
    load();
  };

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Tag size={24} /> Cupones de Descuento</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Nuevo cupón
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 mb-6 space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">{editingId ? 'Editar cupón' : 'Nuevo cupón'}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Código</label>
              <input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
              <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Valor</label>
              <input type="number" min="0" step="0.01" className={inputClass} value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Compra mínima ($)</label>
              <input type="number" min="0" className={inputClass} value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Usos máximos (0=ilimitado)</label>
              <input type="number" min="0" className={inputClass} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Expira</label>
              <input type="date" className={inputClass} value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
            Activo
          </label>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors">
            {editingId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Valor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Mínimo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Usos</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                <td className="px-4 py-3">{c.type === 'percentage' ? '%' : '$'}</td>
                <td className="px-4 py-3">{c.value}{c.type === 'percentage' ? '%' : ''}</td>
                <td className="px-4 py-3 hidden sm:table-cell">${c.minPurchase}</td>
                <td className="px-4 py-3 hidden sm:table-cell">{c.usedCount}/{c.maxUses || '∞'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(c)} className="text-gray-500 hover:text-primary p-1"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-500 hover:text-red-500 p-1 ml-1"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No hay cupones creados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
