import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Upload, X, ChevronLeft, ChevronRight, ImageIcon, Star, ShoppingCart } from 'lucide-react';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { assertFileSizeWithinUploadLimit, uploadService } from '../../services/upload.service';
import { assetUrl } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import type { Product, Category } from '../../types';
import toast from 'react-hot-toast';
import { uploadHints } from '../../constants/upload';

interface FormImage {
  url: string;
}

export default function AdminProducts() {
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', description: '', price: '', salePrice: '', stock: '0',
    categoryId: '', featured: false, active: true, images: [] as FormImage[],
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      productService.getAllProducts({ limit: '100' }),
      categoryService.getAllCategories(),
    ]).then(([res, cats]) => {
      setProducts(res.products || []);
      setCategories(cats);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', salePrice: '', stock: '0', categoryId: '', featured: false, active: true, images: [] });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : '', stock: String(p.stock),
      categoryId: String(p.categoryId), featured: p.featured, active: p.active,
      images: (p.images || []).map((img) => ({ url: img.url })),
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    for (const file of list) {
      try {
        assertFileSizeWithinUploadLimit(file);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Error con ${file.name}`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }
    setUploading(true);
    const newImages: FormImage[] = [];
    for (const file of list) {
      try {
        const result = await uploadService.uploadImage(file);
        newImages.push({ url: result.url });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Error al subir ${file.name}`);
      }
    }
    if (newImages.length > 0) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast.success(`${newImages.length} imagen${newImages.length > 1 ? 'es subidas' : ' subida'}`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const moveImage = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= form.images.length) return;
    setForm((prev) => {
      const imgs = [...prev.images];
      [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
      return { ...prev, images: imgs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
        featured: form.featured,
        active: form.active,
        images: form.images,
      };

      if (editing) {
        await productService.updateProduct(editing.id, data);
        toast.success('Producto actualizado');
      } else {
        await productService.createProduct(data);
        toast.success('Producto creado');
      }
      resetForm();
      load();
    } catch {
      toast.error('Error al guardar producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Producto eliminado');
      load();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Nombre</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Descripción</label>
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Image upload zone */}
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Fotos del producto</label>
            <p className="text-xs text-gray-400 mb-3">{uploadHints.productPhotos}</p>

            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {form.images.map((img, i) => (
                  <div key={`${img.url}-${i}`} className="relative group">
                    <div className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                      <img src={assetUrl(img.url)} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {i === 0 && (
                      <span className="absolute -top-2 -left-2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star size={8} /> Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-all z-10"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 pb-0.5">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(i, -1)}
                          className="bg-black/60 text-white rounded p-0.5 hover:bg-black/80"
                          title="Mover a la izquierda"
                        >
                          <ChevronLeft size={12} />
                        </button>
                      )}
                      {i < form.images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(i, 1)}
                          className="bg-black/60 text-white rounded p-0.5 hover:bg-black/80"
                          title="Mover a la derecha"
                        >
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 w-full justify-center"
            >
              <Upload size={16} />
              {uploading ? 'Subiendo...' : 'Subir imágenes'}
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Precio</label>
            <input type="number" step="0.01" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Precio oferta</label>
            <input type="number" step="0.01" className={inputClass} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Stock</label>
            <input type="number" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Categoría</label>
            <select className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-primary" />
              Destacado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-primary" />
              Activo
            </label>
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="border px-6 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-14"></th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const thumb = assetUrl(p.images?.[0]?.url || '');
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border flex items-center justify-center shrink-0">
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingCart size={16} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-800">{p.name}</span>
                          {p.featured && (
                            <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                      <td className="px-4 py-3 text-right">
                        {p.salePrice ? (
                          <><span className="text-red-600 font-medium">{currency}{Number(p.salePrice).toLocaleString()}</span> <span className="text-gray-400 line-through text-xs">{currency}{Number(p.price).toLocaleString()}</span></>
                        ) : (
                          <span className="font-medium">{currency}{Number(p.price).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{p.stock}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {p.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
