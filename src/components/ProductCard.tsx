import React from 'react';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link to={`/product/${id}`} className="block">
      <div className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/30 hover:border-yellow-400/40 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-400/10 hover:-translate-y-1">
        
        {/* Image container */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />
          
          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
              -{discount}%
            </div>
          )}

          {/* Available status */}
          <div className="absolute top-3 right-3">
            <span className="bg-slate-800/80 backdrop-blur-sm text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
              Disponible
            </span>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4">
          <h3 className="text-slate-200 font-semibold text-lg mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300">
            {name}
          </h3>
          
          <p className="text-slate-400 text-sm mb-3 line-clamp-2 leading-relaxed">
            {description}
          </p>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-3">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={`${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400' 
                      : 'text-slate-600'
                  } transition-colors duration-200`} 
                  fill={i < Math.floor(rating) ? 'currentColor' : 'none'} 
                />
              ))}
            </div>
            <span className="text-slate-400 text-xs">
              <span className="font-medium text-slate-300">{rating.toFixed(1)}</span> ({reviews})
            </span>
          </div>
          
          {/* Price section */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-yellow-400 font-bold text-xl">
                ${price.toLocaleString('es-CO')}
              </span>
              {originalPrice > price && (
                <span className="text-slate-500 text-sm line-through">
                  ${originalPrice.toLocaleString('es-CO')}
                </span>
              )}
            </div>
            
            {/* Savings indicator */}
            {originalPrice > price && (
              <div className="text-green-400 text-xs font-medium bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                Ahorra ${(originalPrice - price).toLocaleString('es-CO')}
              </div>
            )}
          </div>

          {/* Add to cart button - always visible */}
          <button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ShoppingCart size={16} className="inline mr-2" />
            Agregar al Carrito
          </button>
        </div>

        {/* Subtle border glow effect */}
        <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/20 group-hover:via-yellow-400/5 group-hover:to-yellow-400/20 transition-all duration-500 pointer-events-none" />
      </div>
    </Link>
  );
};

export default ProductCard;