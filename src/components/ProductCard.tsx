import React, { useMemo, useCallback } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useToast } from './ToastProvider';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { push } = useToast();
  const { id, name, price, originalPrice, discount, rating, reviews, imageUrl, description } = product;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      addToCart(product);
      push({
        type: 'success',
        title: 'Agregado al carrito',
        message: `${name} fue agregado correctamente.`,
      });
    },
    [addToCart, product, name, push]
  );

  const fullStars = Math.floor(rating);
  const stars = useMemo(() => Array.from({ length: 5 }, (_, i) => i < fullStars), [fullStars]);

  return (
    <Link to={`/product/${id}`} className="block group">
      <div className="h-full bg-white dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-150">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-purple-50 dark:bg-purple-900/20">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            width={640}
            height={640}
            className="w-full h-full object-cover"
            style={{ display: 'block' }}
            fetchPriority="low"
          />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-emerald-950 font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg">
              -{discount}% OFF
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white/95 dark:bg-purple-900/95 text-purple-700 dark:text-purple-300 text-xs px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Disponible
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="min-h-[60px] mb-3">
            <h3 className="text-purple-950 dark:text-purple-50 font-semibold text-sm md:text-base line-clamp-2 mb-1">
              {name}
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-xs md:text-sm line-clamp-2 opacity-80">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {stars.map((on, i) => (
                <Star
                  key={i}
                  size={14}
                  className={on ? 'text-purple-600 dark:text-purple-400' : 'text-purple-300 dark:text-purple-700'}
                  fill={on ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400">
              <span className="font-semibold text-purple-950 dark:text-purple-50">{rating.toFixed(1)}</span> ({reviews})
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3 flex-wrap">
            <span className="text-purple-950 dark:text-purple-50 font-bold text-lg">
              ${price.toLocaleString('es-CO')}
            </span>
            {originalPrice > price && (
              <>
                <span className="text-purple-500 dark:text-purple-500 text-sm line-through opacity-60">
                  ${originalPrice.toLocaleString('es-CO')}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold ml-auto bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                  Ahorra ${(originalPrice - price).toLocaleString('es-CO')}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-150 shadow-sm hover:shadow-md"
          >
            <ShoppingCart size={16} />
            Agregar al Carrito
          </button>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(ProductCard);
