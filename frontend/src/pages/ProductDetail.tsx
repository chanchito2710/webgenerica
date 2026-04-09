import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Minus, Plus, Check } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';
import { productService } from '../services/product.service';
import { assetUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import type { Product, ProductVariant } from '../types';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const currency = config?.currency || '$';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAddedPanel, setShowAddedPanel] = useState(false);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      productService.getProductBySlug(slug)
        .then(setProduct)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <>
        <SEO />
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      </>
    );
  }
  if (!product) {
    return (
      <>
        <SEO title="Producto no encontrado" />
        <div className="text-center py-16 text-gray-400">Producto no encontrado</div>
      </>
    );
  }

  const metaDescription = product.description
    ? product.description.replace(/\s+/g, ' ').trim().slice(0, 160)
    : undefined;
  const ogImage = assetUrl(product.images[0]?.url || '');

  const currentPrice = selectedVariant
    ? Number(product.salePrice || product.price) + Number(selectedVariant.priceAdjust)
    : Number(product.salePrice || product.price);

  const originalPrice = selectedVariant
    ? Number(product.price) + Number(selectedVariant.priceAdjust)
    : Number(product.price);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity, selectedVariant?.id);
      setShowAddedPanel(true);
    } catch {
      toast.error('Error al agregar');
    }
  };

  const breadcrumbItems = [
    { label: 'Tienda', to: '/tienda' },
    ...(product.category
      ? [{ label: product.category.name, to: `/tienda?category=${encodeURIComponent(product.category.slug)}` }]
      : []),
    { label: product.name },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title={product.name} description={metaDescription} image={ogImage} />
      <Breadcrumbs items={breadcrumbItems} />
      <Link to="/tienda" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
        <ChevronLeft size={16} /> Volver a la tienda
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {product.images.length > 0 ? (
              <img src={assetUrl(product.images[selectedImage]?.url || '')} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingCart size={64} />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={assetUrl(img.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{product.category?.name}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-bold text-primary">{currency}{currentPrice.toLocaleString()}</span>
                <span className="text-xl text-gray-400 line-through">{currency}{originalPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">{currency}{currentPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Opciones</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedVariant?.id === v.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                  >
                    {v.name}: {v.value}
                    {Number(v.priceAdjust) !== 0 && ` (+${currency}${Number(v.priceAdjust).toLocaleString()})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Cantidad</span>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50">
                <Minus size={16} />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-50">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {!showAddedPanel ? (
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} />
              {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Check size={18} /> Producto agregado al carrito
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/carrito')}
                  className="flex-1 border border-primary text-primary font-semibold py-2.5 rounded-lg hover:bg-primary/5 transition-colors text-sm"
                >
                  Ver carrito
                </button>
                <button
                  onClick={() => navigate('/checkout')}
                  className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  Finalizar compra
                </button>
              </div>
              <button
                onClick={() => setShowAddedPanel(false)}
                className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-sm text-orange-600 mt-2">Quedan solo {product.stock} unidades</p>
          )}

          {product.description && (
            <div className="mt-8 prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
