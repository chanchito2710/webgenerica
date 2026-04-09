import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import type { Category } from '../../types';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', image: '' });

  const load = () => {
    setLoading(true);
    categoryService.getAllCategories().then(setCategories).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => { setForm({ name: '', image: '' }); setEditing(null); setShowForm(false); };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, image: c.image });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoryService.updateCategory(editing.id, form);
        toast.success('Categoría actualizada');
      } else {
        await categoryService.createCategory(form);
        toast.success('Categoría creada');
      }
      resetForm();
      load();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Categoría eliminada');
      load();
    } catch {
      toast.error('Error al eliminar (puede tener productos asociados)');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-600 mb-1 block">Nombre</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600 mb-1 block">URL Imagen</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
            {editing ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" onClick={resetForm} className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Productos</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3 text-right">{c._count?.products || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
