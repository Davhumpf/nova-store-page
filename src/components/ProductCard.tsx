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
    <Link to={`/product/${id}`} className="block">
      <div className="group relative elegant-card halftone-pattern overflow-hidden transition-all duration-300">
        {/* Imagen cuadrada consistente */}
        <div className="relative aspect-square overflow-hidden stipple-pattern">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            width={640}
            height={640}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ display: 'block' }}
            fetchPriority="low"
          />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.2)] uppercase">
              -{discount}%
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white dark:bg-black elegant-text-primary text-[10px] px-3 py-1.5 rounded-lg border-2 border-black/10 dark:border-white/10 flex items-center uppercase font-bold shadow-[0_2px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_4px_rgba(255,255,255,0.08)]">
              <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full mr-1.5 animate-pulse" />
              Disponible
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-3 md:p-4 relative z-10">
          <div className="min-h-[64px] md:min-h-[84px] mb-2">
            <h3 className="elegant-text-primary font-bold text-sm md:text-base line-clamp-2 break-words uppercase">
              {name}
            </h3>
            <p className="elegant-text-secondary text-xs md:text-sm line-clamp-2 leading-snug break-words">
              {description}
            </p>
          </div>

          <div className="flex items-center mb-2 md:mb-3 text-xs">
            <div className="flex items-center mr-2">
              {stars.map((on, i) => (
                <Star
                  key={i}
                  size={12}
                  className={on ? 'text-black dark:text-white' : 'elegant-text-secondary'}
                  fill={on ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="elegant-text-secondary font-semibold">
              <span className="font-bold elegant-text-primary">{rating.toFixed(1)}</span> ({reviews})
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 md:gap-2 justify-between mb-2 md:mb-3">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <span className="elegant-text-primary font-black text-base md:text-lg">
                ${price.toLocaleString('es-CO')}
              </span>
              {originalPrice > price && (
                <span className="elegant-text-secondary text-xs md:text-sm line-through font-semibold">
                  ${originalPrice.toLocaleString('es-CO')}
                </span>
              )}
            </div>
            {originalPrice > price && (
              <div className="hidden sm:block bg-black/5 dark:bg-white/5 elegant-text-primary text-[11px] font-bold px-2 py-1 rounded-md border border-black/10 dark:border-white/10 uppercase">
                Ahorra ${(originalPrice - price).toLocaleString('es-CO')}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full comic-button text-xs md:text-sm flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} className="inking-icon" />
            Agregar al Carrito
          </button>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(ProductCard);