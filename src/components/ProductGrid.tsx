import React, { useState, useRef } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { Grid3X3, List, Filter, Search, SortAsc } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [filterOpen, setFilterOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'grid grid-cols-1 gap-4';
    }
    // ✅ CAMBIO: grid-cols-1 → grid-cols-2 para mostrar 2 columnas en móvil
    return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6';
  };

  const getContainerAnimation = () => {
    return products.length > 0 
      ? 'animate-in fade-in slide-in-from-bottom-4 duration-700' 
      : '';
  };

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-12 h-12 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-300">No se encontraron productos</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Intenta ajustar tus filtros de búsqueda o explora otras categorías disponibles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-200">
            Productos
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({products.length} encontrados)
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-yellow-400/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="name">Ordenar por Nombre</option>
              <option value="price">Ordenar por Precio</option>
              <option value="rating">Ordenar por Rating</option>
            </select>
            <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-yellow-400 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              aria-label="Vista en cuadrícula"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-yellow-400 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              aria-label="Vista en lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-8"></div>

      {/* Products grid */}
      <div
        ref={gridRef}
        className={`${getGridClasses()} ${getContainerAnimation()}`}
        style={{
          '--stagger-delay': '0.1s'
        } as React.CSSProperties}
      >
        {sortedProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'both'
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Load more hint for large datasets */}
      {products.length > 20 && (
        <div className="text-center mt-12 pt-8 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            Mostrando {products.length} productos
          </p>
        </div>
      )}

      {/* Subtle pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD600' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};

export default ProductGrid;