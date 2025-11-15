// src/components/ProductDetailF.tsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Shield,
  Zap,
  Package,
  Truck,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from './ToastProvider';

type PFProduct = {
  id: string;
  name: string;
  imageUrl: string;
  media?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  longDescription?: string;
  inStock: boolean;
  stockQuantity: number;
  shippingInfo: string;
  sku?: string;
};

const isVideo = (url?: string) =>
  !!url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

const ProductDetailF: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { push } = useToast();

  const [product, setProduct] = useState<PFProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setProduct(null);
    setMainLoaded(false);
    setIndex(0);

    (async () => {
      if (!id) { setLoading(false); return; }
      try {
        const ref = doc(db, 'products-f', id);
        const snap = await getDoc(ref);
        if (!active) return;
        if (snap.exists()) {
          const d = snap.data() as any;
          const media: string[] =
            Array.isArray(d.media) && d.media.length > 0
              ? d.media
              : d.imageUrl
              ? [String(d.imageUrl)]
              : [];
          const cover = media[0] || '';

          setProduct({
            id: snap.id,
            name: d.name ?? 'Producto',
            imageUrl: cover,
            media,
            price: Number(d.price ?? 0),
            originalPrice: Number(d.originalPrice ?? d.price ?? 0),
            discount: Number(d.discount ?? 0),
            rating: Number(d.rating ?? 0),
            reviews: Number(d.reviews ?? 0),
            longDescription: d.longDescription ?? d.description ?? '',
            inStock: d.inStock ?? true,
            stockQuantity: Number(d.stockQuantity ?? 0),
            shippingInfo: d.shippingInfo ?? 'Entrega disponible',
            sku: d.sku ?? '',
          });
        } else {
          setProduct(null);
        }
      } catch {
        setError('No fue posible cargar el producto.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!product?.media?.length) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product?.media]);

  const media = product?.media ?? (product?.imageUrl ? [product.imageUrl] : []);
  const currentUrl = media[index];

  const next = useCallback(() => {
    if (!media.length) return;
    setMainLoaded(false);
    setIndex((i) => (i + 1) % media.length);
  }, [media.length]);

  const prev = useCallback(() => {
    if (!media.length) return;
    setMainLoaded(false);
    setIndex((i) => (i - 1 + media.length) % media.length);
  }, [media.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  const handleAddToCart = useCallback(() => {
    if (!product || !product.inStock || product.stockQuantity <= 0) return;
    const payload = { ...product, imageUrl: product.imageUrl || (product.media?.[0] ?? '') };
    addToCart(payload as any);
    push({
      type: 'success',
      title: 'Agregado al carrito',
      message: `${product.name} fue agregado correctamente.`,
    });
  }, [addToCart, product, push]);

  const hasDiscount = useMemo(
    () => product && product.originalPrice && product.originalPrice > product.price,
    [product]
  );

  if (loading) {
    return (
      <div className="bg-[#F2F2F2] dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 py-16">
          <div className="w-12 h-12 border-4 border-[#BA68C8] dark:border-[#CE93D8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#595959] dark:text-gray-400 font-light">Cargando producto…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#F2F2F2] dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md py-16">
          <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-lg dark:shadow-none border border-[#A6A6A6]/20 dark:border-gray-700">
            <ShoppingCart className="w-12 h-12 text-[#595959] dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-light text-[#0D0D0D] dark:text-white">Producto no disponible</h2>
          <p className="text-[#595959] dark:text-gray-400 font-light">{error ?? 'No existe o fue eliminado.'}</p>
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/shop-f'))}
            className="inline-flex items-center gap-2 bg-[#0D0D0D] dark:bg-gray-700 hover:bg-[#262626] dark:hover:bg-gray-600 text-[#BA68C8] dark:text-[#CE93D8] px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md dark:shadow-none"
          >
            <ArrowLeft size={18} />
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black py-6 min-h-screen ">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/shop-f'))}
          className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-accent-primary dark:hover:text-accent-primary mb-6 transition-colors duration-200 font-semibold uppercase text-sm"
        >
          <ArrowLeft size={16} />
          <span>Volver a Productos</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Galería */}
          <div className="order-1 animate-scale-in">
            <div
              className="relative border border-primary rounded-lg overflow-hidden "
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="aspect-square relative overflow-hidden">
                {!mainLoaded && (
                  <div className="absolute inset-0 bg-[#F2F2F2] dark:bg-gray-700 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-400 border-t-accent-primary rounded-full animate-spin" />
                  </div>
                )}

                {isVideo(currentUrl) ? (
                  <video
                    key={currentUrl}
                    src={currentUrl}
                    controls
                    className={`w-full h-full object-cover ${mainLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
                    onLoadedData={() => setMainLoaded(true)}
                    poster={product.imageUrl || undefined}
                  />
                ) : (
                  <img
                    key={currentUrl}
                    src={currentUrl}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    width={1024}
                    height={1024}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${mainLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setMainLoaded(true)}
                    style={{ display: 'block' }}
                  />
                )}

                {/* Badges */}
                {product.discount && product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-accent-error text-white font-bold text-xs px-3 py-1.5 border border-primary rounded-lg uppercase">
                    -{product.discount}%
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {product.inStock && product.stockQuantity > 0 ? (
                    <span className="bg-accent-success text-black dark:text-white text-xs px-3 py-1.5 border border-primary rounded-lg flex items-center uppercase font-bold">
                      <span className="w-2 h-2 bg-black dark:bg-white rounded-full mr-2 animate-pulse" />
                      En stock ({product.stockQuantity})
                    </span>
                  ) : (
                    <span className="bg-accent-error text-white text-xs px-3 py-1.5 border border-primary rounded-lg flex items-center uppercase font-bold">
                      <span className="w-2 h-2 bg-white rounded-full mr-2" />
                      Sin stock
                    </span>
                  )}
                </div>

                {/* Controles */}
                {media.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-accent-primary hover:bg-accent-primary text-black dark:text-white border border-primary rounded-lg w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 "
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="text-black dark:text-white font-black" size={20} />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent-primary hover:bg-accent-primary text-black dark:text-white border border-primary rounded-lg w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 "
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="text-black dark:text-white font-black" size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Miniaturas */}
            {media.length > 1 && (
              <div className="grid grid-cols-6 gap-2 mt-3">
                {media.map((m, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={m + i}
                      onClick={() => {
                        setIndex(i);
                        setMainLoaded(false);
                      }}
                      className={`relative aspect-square overflow-hidden border-3 transition-all duration-200 border border-primary rounded-lg ${
                        active ? 'border-accent-primary' : 'border-gray-400 hover:border-accent-primary'
                      }`}
                      title={`Vista ${i + 1}`}
                    >
                      {isVideo(m) ? (
                        <div className="w-full h-full bg-accent-primary/80 flex items-center justify-center">
                          <Play className="text-white" size={18} />
                        </div>
                      ) : (
                        <img src={m} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 bg-accent-primary text-black font-bold border border-primary rounded-lg">
                        {i + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="order-2 space-y-5">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-black dark:text-white leading-tight break-words title-shadow uppercase">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating ?? 0) ? 'text-accent-primary' : 'text-gray-400 dark:text-gray-600'}
                      fill={i < Math.floor(product.rating ?? 0) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">
                  {(product.rating ?? 0).toFixed(1)} • {product.reviews ?? 0} reseñas
                </span>
              </div>
            </div>

            {/* Precio */}
            <div className="classic-card p-5 ">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-accent-primary title-shadow">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                  {hasDiscount && product.originalPrice && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through font-semibold">
                      ${product.originalPrice.toLocaleString('es-CO')}
                    </span>
                  )}
                </div>
                {hasDiscount && product.originalPrice && (
                  <div className="bg-accent-primary text-black font-bold text-xs px-2 py-1 border border-primary rounded-lg inline-block uppercase">
                    Ahorra ${(product.originalPrice - product.price).toLocaleString('es-CO')}
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="speech-bubble">
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm font-medium whitespace-pre-line">
                {product.longDescription || '—'}
              </div>
            </div>

            {/* Beneficios físicos */}
            <div className="flex flex-wrap items-center justify-center gap-4 classic-card p-4 ">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 text-xs font-bold uppercase relative z-10">
                <Truck className="w-4 h-4 text-accent-primary" />
                <span>{product.shippingInfo}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 text-xs font-bold uppercase relative z-10">
                <Shield className="w-4 h-4 text-accent-primary" />
                <span>Garantía total</span>
              </div>
              {product.sku && (
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 text-xs font-bold uppercase relative z-10">
                  <Package className="w-4 h-4 text-accent-primary" />
                  <span>SKU: {product.sku}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || product.stockQuantity <= 0}
                className={`w-full py-3.5 px-6 font-black text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                  product.inStock && product.stockQuantity > 0
                    ? 'bg-accent-primary hover:bg-accent-primary text-white classic-btn '
                    : 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-400 cursor-not-allowed border border-primary rounded-lg uppercase'
                }`}
              >
                <ShoppingCart size={18} />
                {product.inStock && product.stockQuantity > 0
                  ? 'Añadir al Carrito'
                  : 'Sin stock'}
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-bold uppercase">
                <Zap className="w-4 h-4 text-accent-primary" />
                <span>Compra segura con envío garantizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailF;