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
      <div className="h-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-150">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-zinc-800">
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
            <div className="absolute top-3 left-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-zinc-900 font-semibold text-xs px-2 py-1 rounded-md">
              -{discount}%
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white/95 dark:bg-zinc-900/95 text-stone-700 dark:text-stone-300 text-xs px-2 py-1 rounded-md border border-stone-200 dark:border-zinc-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Disponible
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="min-h-[60px] mb-3">
            <h3 className="text-stone-900 dark:text-stone-100 font-semibold text-sm md:text-base line-clamp-2 mb-1">
              {name}
            </h3>
            <p className="text-stone-600 dark:text-stone-400 text-xs md:text-sm line-clamp-2">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {stars.map((on, i) => (
                <Star
                  key={i}
                  size={14}
                  className={on ? 'text-stone-900 dark:text-stone-100' : 'text-stone-300 dark:text-zinc-700'}
                  fill={on ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-stone-900 dark:text-stone-100">{rating.toFixed(1)}</span> ({reviews})
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-stone-900 dark:text-stone-100 font-bold text-lg">
              ${price.toLocaleString('es-CO')}
            </span>
            {originalPrice > price && (
              <>
                <span className="text-stone-500 dark:text-stone-500 text-sm line-through">
                  ${originalPrice.toLocaleString('es-CO')}
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-400 ml-auto">
                  Ahorra ${(originalPrice - price).toLocaleString('es-CO')}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white dark:text-zinc-900 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors duration-150"
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
