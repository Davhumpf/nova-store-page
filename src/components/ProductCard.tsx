import React, { useMemo, useCallback } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { id, name, price, originalPrice, discount, rating, reviews, imageUrl, description } = product;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      addToCart(product);
    },
    [addToCart, product]
  );

  const fullStars = Math.floor(rating);
  const stars = useMemo(
    () => Array.from({ length: 5 }, (_, i) => i < fullStars),
    [fullStars]
  );

  return (
    <Link to={`/product/${id}`} className="block">
      <div className="group relative bg-slate-900/70 rounded-2xl overflow-hidden border border-slate-700/40 transition-transform duration-150 will-change-transform">
        {/* Imagen */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            width={640}
            height={480}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            style={{ aspectRatio: '4 / 3', display: 'block' }}
            fetchPriority="low"   // ✅ camelCase correcto
          />

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full">
              -{discount}%
            </div>
          )}

          <div className="absolute top-3 right-3">
            <span className="bg-slate-900/80 text-green-400 text-[11px] px-2 py-1 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />
              Disponible
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="text-slate-200 font-semibold text-base mb-1.5 line-clamp-2">
            {name}
          </h3>

          <p className="text-slate-400 text-sm mb-3 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-3">
              {stars.map((on, i) => (
                <Star
                  key={i}
                  size={14}
                  className={on ? 'text-yellow-400' : 'text-slate-600'}
                  fill={on ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-slate-400 text-xs">
              <span className="font-medium text-slate-300">{rating.toFixed(1)}</span> ({reviews})
            </span>
          </div>

          {/* Precio */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-yellow-400 font-bold text-lg">
                ${price.toLocaleString('es-CO')}
              </span>
              {originalPrice > price && (
                <span className="text-slate-500 text-sm line-through">
                  ${originalPrice.toLocaleString('es-CO')}
                </span>
              )}
            </div>

            {originalPrice > price && (
              <div className="text-green-400 text-[11px] font-medium bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                Ahorra ${(originalPrice - price).toLocaleString('es-CO')}
              </div>
            )}
          </div>

          {/* Botón */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-2 px-4 rounded-xl font-semibold text-sm transition-transform duration-150 hover:scale-[1.02]"
          >
            <ShoppingCart size={16} className="inline mr-2" />
            Agregar al Carrito
          </button>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(ProductCard);
