// src/components/ProductDetailF.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Star, ShoppingCart, ArrowLeft, Shield, Zap, Check, Package, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from './ToastProvider';

type PFProduct = {
  id: string;
  name: string;
  imageUrl: string;
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

const ProductDetailF: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { push } = useToast();

  const [product, setProduct] = useState<PFProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setProduct(null);
    setImageLoaded(false);

    (async () => {
      if (!id) { setLoading(false); return; }
      try {
        const ref = doc(db, 'products-f', id); // 👈 colección de físicos
        const snap = await getDoc(ref);
        if (!active) return;
        if (snap.exists()) {
          const d = snap.data() as any;
          setProduct({
            id: snap.id,
            name: d.name ?? 'Producto',
            imageUrl: d.imageUrl ?? '',
            price: Number(d.price ?? 0),
            originalPrice: Number(d.originalPrice ?? d.price ?? 0),
            discount: Number(d.discount ?? 0),
            rating: Number(d.rating ?? 0),
            reviews: Number(d.reviews ?? 0),
            longDescription: d.longDescription ?? d.description ?? '',
            inStock: d.inStock ?? true,
            stockQuantity: Number(d.stockQuantity ?? 0),
            shippingInfo: d.shippingInfo ?? 'Entrega disponible',
            sku: d.sku ?? ''
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
  }, [id]);

  const handleAddToCart = useCallback(() => {
    if (!product || !product.inStock || product.stockQuantity <= 0) return;
    addToCart(product as any);
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
      <div className="bg-slate-900 fix-1px flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300">Cargando producto…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-slate-900 fix-1px flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-200">Producto no disponible</h2>
          <p className="text-slate-400">{error ?? 'No existe o fue eliminado.'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-5 py-2.5 rounded-lg font-semibold"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 py-4 fix-1px">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 mb-4"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Volver a Productos</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Imagen */}
          <div className="order-1">
            <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <div className="aspect-square relative overflow-hidden">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-slate-600 border-t-yellow-400 rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={product.imageUrl}
                  alt={product.name}
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
                  <div className="absolute top-2 left-2 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-lg">
                    -{product.discount}%
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {product.inStock && product.stockQuantity > 0 ? (
                    <span className="bg-slate-900/85 text-green-400 text-[11px] px-2 py-1 rounded-lg flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />
                      En stock ({product.stockQuantity})
                    </span>
                  ) : (
                    <span className="bg-slate-900/85 text-red-400 text-[11px] px-2 py-1 rounded-lg flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5" />
                      Sin stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="order-2 space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 leading-tight break-words">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating ?? 0) ? 'text-yellow-400' : 'text-slate-600'}
                      fill={i < Math.floor(product.rating ?? 0) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-slate-300 text-sm">
                  {product.rating?.toFixed(1) ?? '0.0'} • {product.reviews ?? 0} reseñas
                </span>
              </div>
            </div>

            {/* Bloque de precio */}
            <div className="rounded-xl border border-slate-800 p-4 bg-slate-950/60">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-yellow-400">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                  {hasDiscount && product.originalPrice && (
                    <span className="text-sm text-slate-500 line-through">
                      ${product.originalPrice.toLocaleString('es-CO')}
                    </span>
                  )}
                </div>
                {hasDiscount && product.originalPrice && (
                  <div className="bg-green-400/10 text-green-400 font-bold text-[11px] px-2 py-1 rounded-md inline-block">
                    Ahorra ${(product.originalPrice - product.price).toLocaleString('es-CO')}
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="rounded-lg border border-slate-800 p-4 bg-slate-950/60">
              <p className="text-slate-300 leading-relaxed text-sm">
                {product.longDescription}
              </p>
            </div>

            {/* Beneficios físicos */}
            <div className="flex items-center justify-center gap-6 rounded-lg border border-green-500/30 p-3 bg-emerald-900/10">
              <div className="flex items-center gap-1 text-slate-300 text-xs">
                <Truck className="w-3 h-3 text-green-400" />
                <span>{product.shippingInfo}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300 text-xs">
                <Shield className="w-3 h-3 text-green-400" />
                <span>Garantía total</span>
              </div>
              {product.sku && (
                <div className="flex items-center gap-1 text-slate-300 text-xs">
                  <Package className="w-3 h-3 text-green-400" />
                  <span>SKU: {product.sku}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="space-y-3 mb-0">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || product.stockQuantity <= 0}
                className={`w-full py-3 px-6 rounded-xl font-black text-base flex items-center justify-center gap-2 ${
                  product.inStock && product.stockQuantity > 0
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-900'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={18} />
                {product.inStock && product.stockQuantity > 0
                  ? 'Añadir al Carrito'
                  : 'Sin stock'}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Zap className="w-4 h-4 text-green-400" />
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
