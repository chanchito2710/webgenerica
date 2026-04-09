import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Truck, CreditCard, Wrench, ChevronRight, type LucideIcon } from 'lucide-react';
import { InstagramIcon } from '../components/SocialIcons';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import CategorySkeleton from '../components/CategorySkeleton';
import HeroCarousel from '../components/HeroCarousel';
import SEO from '../components/SEO';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { configService } from '../services/config.service';
import { assetUrl } from '../services/api';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import type { Product, Category, HeroSlide } from '../types';
import toast from 'react-hot-toast';

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  'credit-card': CreditCard,
  wrench: Wrench,
};

function normalizeSlides(raw: unknown): HeroSlide[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'imageUrl' in raw) return [raw as HeroSlide];
  return [];
}

export default function Home() {
  const { config, refresh } = useSiteConfig();
  const { isAdmin } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newest, setNewest] = useState<Product[]>([]);
  const [onSale, setOnSale] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSlides, setLocalSlides] = useState<HeroSlide[] | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const configSlides = normalizeSlides((config as any)?.heroSlides ?? (config as any)?.heroBanner);
  const slides = localSlides ?? configSlides;
  const benefits = config?.benefits;
  const instaSection = (config as any)?.instagramSection as { title?: string; url?: string; username?: string } | undefined;
  const promoBanner = (config as any)?.promoBanner as { imageUrl?: string; title?: string; subtitle?: string; linkUrl?: string; linkText?: string } | undefined;

  const handleSlidesChange = useCallback(
    (updated: HeroSlide[]) => {
      setLocalSlides(updated);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await configService.updateSiteConfig({ heroBanner: updated } as any);
          await refresh();
          toast.success('Cambios guardados', { duration: 1500, position: 'bottom-center' });
        } catch {
          toast.error('Error al guardar');
        }
      }, 800);
    },
    [refresh],
  );

  useEffect(() => {
    Promise.all([
      productService.getProducts({ featured: 'true', limit: '12' }),
      productService.getProducts({ limit: '50' }),
      productService.getProducts({ limit: '8', sort: 'newest' }),
      categoryService.getCategories(),
    ]).then(([featRes, allRes, newRes, cats]) => {
      setFeatured(featRes.products || []);
      setOnSale((allRes.products || []).filter((p) => p.salePrice !== null));
      setNewest(newRes.products || []);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const filteredFeatured = activeTab === 'all'
    ? featured
    : featured.filter((p) => p.category?.slug === activeTab);

  const featuredCats = [...new Map<string, Category>(
    featured
      .filter((p) => p.category?.slug)
      .map((p) => [p.category.slug, p.category] as [string, Category])
  ).values()];

  return (
    <div>
      <SEO />
      <HeroCarousel slides={slides} onSlidesChange={isAdmin ? handleSlidesChange : undefined} />

      {/* Beneficios */}
      {benefits && benefits.length > 0 && (
        <section className="bg-gray-50 py-6 sm:py-8 border-b">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((b, i) => {
              const Icon = iconMap[b.icon] || Truck;
              const isCustom = b.icon === 'custom' && b.customIcon;
              return (
                <div key={i} className="flex items-center gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-full shrink-0">
                    {isCustom ? (
                      <img src={assetUrl(b.customIcon!)} alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    ) : (
                      <Icon className="text-primary" size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{b.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{b.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categorías con imágenes */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 5 }, (_, i) => <CategorySkeleton key={i} />)
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/tienda?category=${cat.slug}`}
                  className="bg-white border rounded-xl overflow-hidden text-center hover:shadow-md hover:border-primary transition-all group"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {cat.image ? (
                      <img src={assetUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{cat.name}</span>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* Productos Destacados con tabs */}
      {(loading || featured.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Destacados</h2>
            {!loading && (
              <Link to="/tienda?featured=true" className="text-primary hover:underline flex items-center gap-1 text-xs sm:text-sm font-medium">
                Ver todos <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {!loading && featuredCats.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Todos
              </button>
              {featuredCats.map((cat) => cat && (
                <button
                  key={cat.slug}
                  onClick={() => setActiveTab(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === cat.slug ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {loading
              ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
              : filteredFeatured.slice(0, 8).map((p, i) => (
                  <div
                    key={p.id}
                    className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
          </div>
        </section>
      )}

      {!loading && (
        <>
          {/* Banner Promocional */}
          {promoBanner?.imageUrl && (
            <section className="relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
                <div className="relative rounded-2xl overflow-hidden min-h-[200px] sm:min-h-[280px] flex items-center">
                  <img src={assetUrl(promoBanner.imageUrl!)} alt={promoBanner.title || ''} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="relative z-10 p-6 sm:p-10 max-w-lg text-white">
                    {promoBanner.title && <h2 className="text-2xl sm:text-3xl font-bold mb-2">{promoBanner.title}</h2>}
                    {promoBanner.subtitle && <p className="text-sm sm:text-base opacity-90 mb-4">{promoBanner.subtitle}</p>}
                    {promoBanner.linkUrl && (
                      <Link to={promoBanner.linkUrl} className="inline-block bg-white text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        {promoBanner.linkText || 'Ver más'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Ofertas Especiales */}
          {onSale.length > 0 && (
            <section className="bg-gray-50 py-8 sm:py-12">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-red-600">Ofertas Especiales</h2>
                  <Link to="/tienda" className="text-primary hover:underline flex items-center gap-1 text-xs sm:text-sm font-medium">
                    Ver todos <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {onSale.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Novedades */}
          {newest.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Novedades</h2>
                <Link to="/tienda?sort=newest" className="text-primary hover:underline flex items-center gap-1 text-xs sm:text-sm font-medium">
                  Ver todos <ChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {newest.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}

          {/* Instagram / Redes */}
          {instaSection?.url && (
            <section className="bg-gradient-to-r from-purple-600 to-pink-500 py-10 sm:py-14">
              <div className="max-w-7xl mx-auto px-4 text-center text-white">
                <InstagramIcon size={40} className="mx-auto mb-3" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{instaSection.title || '¡Seguinos en Instagram!'}</h2>
                {instaSection.username && <p className="text-lg opacity-90 mb-4">@{instaSection.username}</p>}
                <a
                  href={instaSection.url.startsWith('http') ? instaSection.url : `https://${instaSection.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-purple-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Seguir
                </a>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
