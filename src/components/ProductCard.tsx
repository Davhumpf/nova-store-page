import React, { useMemo, useCallback } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useToast } from '../ToastProvider';
import Card from './Card';

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
        message: `${name} fue agregado correctamente`
      });
    },
    [addToCart, product, push, name]
  );

  const formattedPrice = useMemo(() => `$${price.toLocaleString()}`, [price]);
  const formattedOriginalPrice = useMemo(
    () => (originalPrice ? `$${originalPrice.toLocaleString()}` : null),
    [originalPrice]
  );
  const hasDiscount = useMemo(() => discount && discount > 0, [discount]);

  return (
    <Link to={`/product/${id}`} className="block group">
      <Card variant="hover" className="h-full flex flex-col overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-light-accent-primary dark:bg-dark-accent-primary text-light-text-inverse dark:text-dark-text-inverse text-xs font-bold px-2 py-1 rounded-badge">
              -{discount}%
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          className="absolute top-3 right-3 z-10 p-2 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 backdrop-blur-sm rounded-full hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
          onClick={(e) => {
            e.preventDefault();
            // Add to favorites logic
          }}
          aria-label="Agregar a favoritos"
        >
          <svg
            className="w-5 h-5 stroke-light-text-secondary dark:stroke-dark-text-secondary hover:stroke-light-accent-primary dark:hover:stroke-dark-accent-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Product Image */}
        <div className="relative w-full pt-[75%] bg-light-bg-tertiary dark:bg-dark-bg-tertiary overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col p-4 space-y-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary line-clamp-2 group-hover:text-light-accent-primary dark:group-hover:text-dark-accent-primary transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {rating && reviews && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating)
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'stroke-light-border-secondary dark:stroke-dark-border-secondary'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">({reviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
              {formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full mt-3 bg-light-accent-primary dark:bg-dark-accent-primary hover:bg-light-accent-hover dark:hover:bg-dark-accent-hover text-light-text-inverse dark:text-dark-text-inverse font-semibold py-3 px-4 rounded-input transition-colors duration-200 flex items-center justify-center gap-2 group/button"
          >
            <ShoppingCart className="w-5 h-5 group-hover/button:scale-110 transition-transform" />
            ¡AÑADIR!
          </button>
        </div>
      </Card>
    </Link>
  );
};

export default React.memo(ProductCard);
