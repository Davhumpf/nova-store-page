import React, { useMemo, useCallback } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useToast } from './ToastProvider'; // importa el hook

interface ProductCardProps { product: Product; }

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { push } = useToast();
  const { id, name, price, originalPrice, discount, rating, reviews, imageUrl, description } = product;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    push({
      type: 'success',
      title: 'Agregado al carrito',
      message: `${name} fue agregado correctamente.`,
    });
  }, [addToCart, product, name, push]);

  const fullStars = Math.floor(rating);
  const stars = useMemo(() => Array.from({ length: 5 }, (_, i) => i < fullStars), [fullStars]);

  return (
    <Link to={`/product/${id}`} className="block animate-comic-pop">
      <div className="group relative comic-panel halftone-pattern overflow-hidden transition-all duration-200 hover:speed-lines comic-hover">
        {/* Imagen cuadrada consistente */}
        <div className="relative aspect-square overflow-hidden stipple-pattern">
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
            <div className="absolute top-2 left-2 bg-pop-red text-white font-bold text-[10px] px-2 py-1 comic-border-light uppercase">
              -{discount}%
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-pop-green text-black dark:text-white text-[10px] px-2 py-1 comic-border-light flex items-center uppercase font-bold">
              <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full mr-1.5 animate-pulse" />
              Disponible
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-3 md:p-4 relative z-10">
          <div className="min-h-[64px] md:min-h-[84px] mb-2">
            <h3 className="text-gray-900 dark:text-white font-bold text-sm md:text-base line-clamp-2 break-words uppercase">
              {name}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm line-clamp-2 leading-snug break-words">
              {description}
            </p>
          </div>

          <div className="flex items-center mb-2 md:mb-3 text-xs">
            <div className="flex items-center mr-2">
              {stars.map((on, i) => (
                <Star
                  key={i}
                  size={12}
                  className={on ? 'text-pop-yellow' : 'text-gray-400 dark:text-gray-600'}
                  fill={on ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">
              <span className="font-bold text-black dark:text-white">{rating.toFixed(1)}</span> ({reviews})
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 md:gap-2 justify-between mb-2 md:mb-3">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <span className="text-pop-orange font-black text-base md:text-lg comic-text-shadow">
                ${price.toLocaleString('es-CO')}
              </span>
              {originalPrice > price && (
                <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm line-through font-semibold">
                  ${originalPrice.toLocaleString('es-CO')}
                </span>
              )}
            </div>
            {originalPrice > price && (
              <div className="hidden sm:block bg-pop-cyan text-black text-[11px] font-bold px-2 py-1 comic-border-light uppercase">
                Ahorra ${(originalPrice - price).toLocaleString('es-CO')}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full comic-button text-xs md:text-sm"
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