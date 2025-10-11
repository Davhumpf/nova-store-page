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
      <div className="bg-[#F2F2F2] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 py-16">
          <div className="w-12 h-12 border-4 border-[#BA68C8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#595959] font-light">Cargando producto…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#F2F2F2] min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md py-16">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border border-[#A6A6A6]/20">
            <ShoppingCart className="w-12 h-12 text-[#595959]" />
          </div>
          <h2 className="text-2xl font-light text-[#0D0D0D]">Producto no disponible</h2>
          <p className="text-[#595959] font-light">{error ?? 'No existe o fue eliminado.'}</p>
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/shop-f'))}
            className="inline-flex items-center gap-2 bg-[#0D0D0D] hover:bg-[#262626] text-[#BA68C8] px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
          >
            <ArrowLeft size={18} />
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F2F2F2] py-6 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/shop-f'))}
          className="inline-flex items-center gap-2 text-[#595959] hover:text-[#BA68C8] mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-light">Volver a Productos</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Galería */}
          <div className="order-1">
            <div
              className="relative rounded-xl border border-[#A6A6A6]/20 overflow-hidden bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="aspect-square relative overflow-hidden">
                {!mainLoaded && (
                  <div className="absolute inset-0 bg-[#F2F2F2] animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#A6A6A6]/30 border-t-[#BA68C8] rounded-full animate-spin" />
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
                  <div className="absolute top-3 left-3 bg-red-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-md">
                    -{product.discount}%
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {product.inStock && product.stockQuantity > 0 ? (
                    <span className="bg-white/95 text-[#4CAF50] text-xs px-3 py-1.5 rounded-lg flex items-center shadow-md border border-[#A6A6A6]/20">
                      <span className="w-2 h-2 bg-[#4CAF50] rounded-full mr-2" />
                      En stock ({product.stockQuantity})
                    </span>
                  ) : (
                    <span className="bg-white/95 text-red-500 text-xs px-3 py-1.5 rounded-lg flex items-center shadow-md border border-[#A6A6A6]/20">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                      Sin stock
                    </span>
                  )}
                </div>

                {/* Controles */}
                {media.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-[#A6A6A6]/20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="text-[#0D0D0D]" size={20} />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-[#A6A6A6]/20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="text-[#0D0D0D]" size={20} />
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
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        active ? 'border-[#BA68C8] shadow-md' : 'border-[#A6A6A6]/20 hover:border-[#BA68C8]/50'
                      }`}
                      title={`Vista ${i + 1}`}
                    >
                      {isVideo(m) ? (
                        <div className="w-full h-full bg-[#0D0D0D]/50 flex items-center justify-center">
                          <Play className="text-white/90" size={18} />
                        </div>
                      ) : (
                        <img src={m} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-[#0D0D0D]/70 text-white font-medium">
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
              <h1 className="text-2xl lg:text-3xl font-light text-[#0D0D0D] leading-tight break-words">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating ?? 0) ? 'text-[#BA68C8]' : 'text-[#A6A6A6]'}
                      fill={i < Math.floor(product.rating ?? 0) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-[#595959] text-sm font-light">
                  {(product.rating ?? 0).toFixed(1)} • {product.reviews ?? 0} reseñas
                </span>
              </div>
            </div>

            {/* Precio */}
            <div className="rounded-xl border border-[#A6A6A6]/20 p-5 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-[#BA68C8]">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                  {hasDiscount && product.originalPrice && (
                    <span className="text-sm text-[#A6A6A6] line-through">
                      ${product.originalPrice.toLocaleString('es-CO')}
                    </span>
                  )}
                </div>
                {hasDiscount && product.originalPrice && (
                  <div className="bg-[#BA68C8]/10 text-[#BA68C8] font-medium text-xs px-2 py-1 rounded-md inline-block">
                    Ahorra ${(product.originalPrice - product.price).toLocaleString('es-CO')}
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="rounded-lg border border-[#A6A6A6]/20 p-5 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div className="text-[#595959] leading-relaxed text-sm font-light whitespace-pre-line">
                {product.longDescription || '—'}
              </div>
            </div>

            {/* Beneficios físicos */}
            <div className="flex flex-wrap items-center justify-center gap-4 rounded-lg border border-[#BA68C8]/30 p-4 bg-[#BA68C8]/5">
              <div className="flex items-center gap-2 text-[#595959] text-xs font-light">
                <Truck className="w-4 h-4 text-[#BA68C8]" />
                <span>{product.shippingInfo}</span>
              </div>
              <div className="flex items-center gap-2 text-[#595959] text-xs font-light">
                <Shield className="w-4 h-4 text-[#BA68C8]" />
                <span>Garantía total</span>
              </div>
              {product.sku && (
                <div className="flex items-center gap-2 text-[#595959] text-xs font-light">
                  <Package className="w-4 h-4 text-[#BA68C8]" />
                  <span>SKU: {product.sku}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || product.stockQuantity <= 0}
                className={`w-full py-3.5 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                  product.inStock && product.stockQuantity > 0
                    ? 'bg-[#0D0D0D] hover:bg-[#262626] text-[#BA68C8] shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:scale-[1.02]'
                    : 'bg-[#A6A6A6]/30 text-[#595959] cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={18} />
                {product.inStock && product.stockQuantity > 0
                  ? 'Añadir al Carrito'
                  : 'Sin stock'}
              </button>

              <div className="flex items-center justify-center gap-2 text-[#595959] text-sm font-light">
                <Zap className="w-4 h-4 text-[#BA68C8]" />
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