import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import type { Product, Category } from '../types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
] as const;

const ALLOWED_SORTS = new Set<string>(SORT_OPTIONS.map((o) => o.value));

function findCategoryBySlug(tree: Category[], slug: string): Category | undefined {
  for (const c of tree) {
    if (c.slug === slug) return c;
    if (c.children?.length) {
      const nested = findCategoryBySlug(c.children, slug);
      if (nested) return nested;
    }
  }
}

function effectiveProductPrice(p: Product): number {
  return p.salePrice != null ? p.salePrice : p.price;
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = searchParams.get('page') || '1';
  const currentFeatured = searchParams.get('featured') || '';
  const sortParam = searchParams.get('sort') || '';
  const currentSort = ALLOWED_SORTS.has(sortParam) ? sortParam : 'newest';

  const selectedCategory = useMemo(
    () => (currentCategory ? findCategoryBySlug(categories, currentCategory) : undefined),
    [categories, currentCategory],
  );

  const subcategories = selectedCategory?.children?.filter(Boolean) ?? [];

  const clientFiltersActive =
    priceMin.trim() !== '' || priceMax.trim() !== '' || onSaleOnly;

  const displayProducts = useMemo(() => {
    let list = products;
    const minRaw = priceMin.trim();
    const maxRaw = priceMax.trim();
    const min = minRaw === '' ? null : Number(minRaw);
    const max = maxRaw === '' ? null : Number(maxRaw);

    list = list.filter((p) => {
      const price = effectiveProductPrice(p);
      if (min !== null && !Number.isNaN(min) && price < min) return false;
      if (max !== null && !Number.isNaN(max) && price > max) return false;
      if (onSaleOnly && p.salePrice == null) return false;
      return true;
    });
    return list;
  }, [products, priceMin, priceMax, onSaleOnly]);

  useEffect(() => {
    categoryService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {
      page: currentPage,
      limit: '12',
      sort: currentSort,
    };
    if (currentCategory) params.category = currentCategory;
    if (currentSearch) params.search = currentSearch;
    if (currentFeatured) params.featured = currentFeatured;

    productService
      .getProducts(params)
      .then((res) => {
        setProducts(res.products || []);
        setTotal(res.total);
        setPages(res.pages);
      })
      .finally(() => setLoading(false));
  }, [currentCategory, currentSearch, currentPage, currentFeatured, currentSort]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const closeMobileFilters = () => setFiltersOpen(false);

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 opacity-70" aria-hidden />
          Categorías
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => setFilter('category', '')}
              className={`w-full text-left text-sm py-1.5 px-2 rounded ${!currentCategory ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Todas
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => setFilter('category', cat.slug)}
                className={`w-full text-left text-sm py-1.5 px-2 rounded ${currentCategory === cat.slug ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {cat.name}
                {cat._count && <span className="text-xs ml-1 opacity-70">({cat._count.products})</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 opacity-70" aria-hidden />
          Ordenar
        </h3>
        <label htmlFor="shop-sort" className="sr-only">
          Ordenar productos
        </label>
        <select
          id="shop-sort"
          value={currentSort}
          onChange={(e) => setFilter('sort', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-800 mb-3">Precio</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="price-min" className="text-xs text-gray-500 block mb-1">
              Mín.
            </label>
            <input
              id="price-min"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="price-max" className="text-xs text-gray-500 block mb-1">
              Máx.
            </label>
            <input
              id="price-max"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">El rango de precio se aplica a los resultados de la página actual.</p>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => setOnSaleOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          En oferta
        </label>
      </div>
    </div>
  );

  const shopBreadcrumbItems = selectedCategory
    ? [
        { label: 'Tienda', to: '/tienda' },
        { label: selectedCategory.name },
      ]
    : [{ label: 'Tienda' }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="Tienda" description="Explora nuestro catálogo de productos" />
      <Breadcrumbs items={shopBreadcrumbItems} />
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tienda</h1>
          <p className="text-sm text-gray-500">
            {clientFiltersActive
              ? `${displayProducts.length} mostrados en esta página${total ? ` · ${total} en el catálogo` : ''}`
              : `${total} productos encontrados`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="md:hidden flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal size={16} aria-hidden />
          Filtros
        </button>
      </div>

      {filtersOpen && (
        <button
          type="button"
          aria-label="Cerrar filtros"
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={closeMobileFilters}
        />
      )}

      <div className="flex gap-8 relative">
        <aside
          className={`
            fixed md:static top-0 left-0 z-50 h-full md:h-auto w-[min(100%,20rem)] md:w-56 shrink-0
            transition-transform duration-200 ease-out
            ${filtersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${!filtersOpen ? 'pointer-events-none md:pointer-events-auto' : ''}
          `}
        >
          <div className="bg-white border-r md:border border-gray-200 md:rounded-lg p-4 h-full md:h-auto overflow-y-auto shadow-xl md:shadow-none min-h-[100dvh] md:min-h-0 pointer-events-auto">
            <div className="flex items-center justify-between md:hidden mb-4 pb-3 border-b border-gray-100">
              <span className="font-semibold text-gray-800">Filtros</span>
              <button
                type="button"
                onClick={closeMobileFilters}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Cerrar panel de filtros"
              >
                <X size={20} />
              </button>
            </div>
            {filterPanel}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {subcategories.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Subcategorías</p>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setFilter('category', child.slug)}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                      currentCategory === child.slug
                        ? 'bg-primary text-white border-primary'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary/40 hover:bg-white'
                    }`}
                  >
                    {child.name}
                    {child._count != null && (
                      <span className="ml-1.5 text-xs opacity-75">({child._count.products})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400">Cargando productos...</div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No se encontraron productos</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8 flex-wrap">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFilter('page', String(p))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${String(p) === currentPage ? 'bg-primary text-white' : 'border text-gray-600 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
