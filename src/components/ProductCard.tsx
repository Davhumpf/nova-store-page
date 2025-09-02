import React, { useMemo, useCallback } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface ProductCardProps { product: Product; }

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { id, name, price, originalPrice, discount, rating, reviews, imageUrl, description } = product;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  }, [addToCart, product]);

  const fullStars = Math.floor(rating);
  const stars = useMemo(() => Array.from({ length: 5 }, (_, i) => i < fullStars), [fullStars]);

  return (
    <Link to={`/product/${id}`} className="block">
      <div className="group relative bg-slate-900/70 rounded-2xl overflow-hidden border border-slate-700/40 transition-transform duration-150 will-change-transform">
        {/* Imagen cuadrada consistente */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            width={640}
            height={640}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            style={{ display: 'block' }}
            fetchPriority="low"
          />

          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white font-bold text-[10px] px-2 py-1 rounded-full">
              -{discount}%
            </div>
          )}

          <div className="absolute top-2 right-2">
            <span className="bg-slate-900/80 text-green-400 text-[10px] px-2 py-1 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />
              Disponible
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-3 md:p-4">
          {/* Título + descripción con altura mínima para alinear cards */}
          <div className="min-h-[64px] md:min-h-[84px] mb-2">
            <h3 className="text-slate-200 font-semibold text-sm md:text-base line-clamp-2 break-words">
              {name}
            </h3>
            <p className="text-slate-400 text-xs md:text-sm line-clamp-2 leading-snug break-words">
              {description}
            </p>
          </div>

          {/* Rating compacto */}
          <div className="flex items-center mb-2 md:mb-3 text-xs">
            <div className="flex items-center mr-2">
              {stars.map((on, i) => (
                <Star
                  key={i}
                  size={12}
                  className={on ? 'text-yellow-400' : 'text-slate-600'}
                  fill={on ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-slate-400">
              <span className="font-medium text-slate-300">{rating.toFixed(1)}</span> ({reviews})
            </span>
          </div>

          {/* Precio en una línea */}
          <div className="flex items-baseline gap-1.5 md:gap-2 justify-between mb-2 md:mb-3">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <span className="text-yellow-400 font-bold text-base md:text-lg">
                ${price.toLocaleString('es-CO')}
              </span>
              {originalPrice > price && (
                <span className="text-slate-500 text-xs md:text-sm line-through">
                  ${originalPrice.toLocaleString('es-CO')}
                </span>
              )}
            </div>

            {originalPrice > price && (
              <div className="hidden sm:block text-green-400 text-[11px] font-medium bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                Ahorra ${(originalPrice - price).toLocaleString('es-CO')}
              </div>
            )}
          </div>

          {/* Botón compacto */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-transform duration-150 hover:scale-[1.02]"
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
