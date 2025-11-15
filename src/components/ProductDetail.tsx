// src/components/ProductDetail.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Star, ShoppingCart, ArrowLeft, Clock, Monitor, Shield, Zap, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from './ToastProvider';

type PDProduct = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  devices?: string;
  longDescription?: string;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { push } = useToast();

  const [product, setProduct] = useState<PDProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackToShop = useCallback(() => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/shop');
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setProduct(null);
    setImageLoaded(false);

    (async () => {
      if (!id) { setLoading(false); return; }
      try {
        const ref = doc(db, 'products', id);
        const snap = await getDoc(ref);
        if (!active) return;
        if (snap.exists()) {
          const d = snap.data() as any;
          setProduct({
            id: snap.id,
            title: d.title ?? d.name ?? 'Producto',
            imageUrl: d.imageUrl ?? '',
            price: Number(d.price ?? 0),
            originalPrice: Number(d.originalPrice ?? d.price ?? 0),
            discount: Number(d.discount ?? 0),
            rating: Number(d.rating ?? 0),
            reviewCount: Number(d.reviewCount ?? d.reviews ?? 0),
            duration: d.duration ?? 'Según plan',
            devices: d.devices ?? 'Multidispositivo',
            longDescription: d.longDescription ?? d.description ?? '',
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

    return () => { active = false; };
  }, [id, location.key]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product as any);
    push({
      type: 'success',
      title: 'Agregado al carrito',
      message: `${product.title} fue agregado correctamente.`,
    });
  }, [addToCart, product, push]);

  const hasDiscount = useMemo(
    () => product && product.originalPrice && product.originalPrice > product.price,
    [product]
  );

  if (loading) {
    return (
      <div className="bg-[#F2F2F2] dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4CAF50] dark:border-[#66FF7A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#595959] dark:text-gray-400 font-light">Cargando producto…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#F2F2F2] dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-lg dark:shadow-none border border-[#A6A6A6]/20 dark:border-gray-700">
            <ShoppingCart className="w-12 h-12 text-[#595959] dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-light text-[#0D0D0D] dark:text-white">Producto no disponible</h2>
          <p className="text-[#595959] dark:text-gray-400 font-light">{error ?? 'No existe o fue eliminado.'}</p>
          <button
            onClick={handleBackToShop}
            className="inline-flex items-center gap-2 bg-[#0D0D0D] dark:bg-gray-700 hover:bg-[#262626] dark:hover:bg-gray-600 text-[#4CAF50] dark:text-[#66FF7A] px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md dark:shadow-none"
          >
            <ArrowLeft size={18} />
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black py-6 min-h-screen crosshatch-pattern">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <button
          onClick={handleBackToShop}
          className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-pop-green dark:hover:text-pop-green mb-6 transition-colors duration-200 font-semibold uppercase text-sm"
        >
          <ArrowLeft size={16} />
          <span>Volver a Productos</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Imagen */}
          <div className="order-1 animate-comic-pop">
            <div className="relative comic-border overflow-hidden bendaydots-pattern">
              <div className="aspect-square relative overflow-hidden">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-[#F2F2F2] dark:bg-gray-700 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-400 border-t-pop-green rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  width={1024}
                  height={1024}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  style={{ display: 'block' }}
                />

                {product.discount && product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-pop-red text-white font-bold text-xs px-3 py-1.5 comic-border-light uppercase">
                    -{product.discount}%
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-pop-green text-black dark:text-white text-xs px-3 py-1.5 comic-border-light flex items-center uppercase font-bold">
                    <span className="w-2 h-2 bg-black dark:bg-white rounded-full mr-2 animate-pulse" />
                    Disponible
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="order-2 space-y-5">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-black dark:text-white leading-tight break-words comic-text-shadow uppercase">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating ?? 0) ? 'text-pop-yellow' : 'text-gray-400 dark:text-gray-600'}
                      fill={i < Math.floor(product.rating ?? 0) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">
                  {product.rating?.toFixed(1) ?? '0.0'} • {product.reviewCount ?? 0} reseñas
                </span>
              </div>
            </div>

            {/* Bloque de precio + specs */}
            <div className="comic-panel p-5 animate-comic-bounce">
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Precio */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-pop-green comic-text-shadow">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                    {hasDiscount && product.originalPrice && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through font-semibold">
                        ${product.originalPrice.toLocaleString('es-CO')}
                      </span>
                    )}
                  </div>
                  {hasDiscount && product.originalPrice && (
                    <div className="bg-pop-cyan text-black font-bold text-xs px-2 py-1 comic-border-light inline-block uppercase">
                      Ahorra ${(product.originalPrice - product.price).toLocaleString('es-CO')}
                    </div>
                  )}
                </div>

                {/* Duración */}
                <div className="text-center border-l-4 border-black dark:border-white pl-4">
                  <Clock className="w-5 h-5 text-pop-blue mx-auto mb-1" />
                  <div className="text-black dark:text-white font-bold text-xs uppercase">Duración</div>
                  <div className="text-gray-700 dark:text-gray-300 text-xs font-semibold">{product.duration}</div>
                </div>

                {/* Dispositivos */}
                <div className="text-center border-l-4 border-black dark:border-white pl-4">
                  <Monitor className="w-5 h-5 text-pop-cyan mx-auto mb-1" />
                  <div className="text-black dark:text-white font-bold text-xs uppercase">Dispositivos</div>
                  <div className="text-gray-700 dark:text-gray-300 text-xs font-semibold">{product.devices}</div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="speech-bubble">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm font-medium">
                {product.longDescription}
              </p>
            </div>

            {/* Beneficios */}
            <div className="flex items-center justify-center gap-6 comic-panel p-4 halftone-pattern">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 text-xs font-bold uppercase relative z-10">
                <Check className="w-4 h-4 text-pop-green" />
                <span>Activación inmediata</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 text-xs font-bold uppercase relative z-10">
                <Shield className="w-4 h-4 text-pop-green" />
                <span>Garantía total</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-pop-green hover:bg-pop-cyan text-black py-3.5 px-6 font-black text-base flex items-center justify-center gap-2 transition-all duration-200 comic-button animate-comic-bounce"
              >
                <ShoppingCart size={18} />
                Añadir al Carrito
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-bold uppercase">
                <Zap className="w-4 h-4 text-pop-yellow" />
                <span>Activación automática tras la compra</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;