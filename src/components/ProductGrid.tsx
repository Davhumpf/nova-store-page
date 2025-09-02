import React, { useMemo, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { Grid3X3, List, Search, SortAsc } from 'lucide-react';

interface ProductGridProps { products: Product[]; }

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const gridRef = useRef<HTMLDivElement>(null);

  // ✅ evita resort en cada render
  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case 'price':  return arr.sort((a, b) => a.price - b.price);
      case 'rating': return arr.sort((a, b) => b.rating - a.rating);
      default:       return arr.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [products, sortBy]);

  const gridClasses =
    viewMode === 'list'
      ? 'grid grid-cols-1 gap-3 md:gap-4'
      : 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5';

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
              Ajusta filtros o prueba otras categorías.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-200">
          Productos
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({products.length})
          </span>
        </h2>

        <div className="flex items-center gap-3">
          {/* Ordenar */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
              className="bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-yellow-400/50 appearance-none"
            >
              <option value="name">Nombre</option>
              <option value="price">Precio</option>
              <option value="rating">Rating</option>
            </select>
            <SortAsc className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Vista */}
          <div className="flex items-center border border-slate-700/50 rounded-lg p-1 bg-slate-800/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
              aria-label="Cuadrícula"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
              aria-label="Lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Línea */}
      <div className="h-px bg-slate-700/40 mb-6 md:mb-8" />

      {/* Grid de productos */}
      <div ref={gridRef} className={gridClasses}>
        {sortedProducts.map((product, i) => (
          <div
            key={product.id}
            className="animate-fadeIn"
            style={{
              animationDuration: '240ms',
              animationDelay: i < 12 ? `${i * 20}ms` : '0ms', // ✅ poco stagger y solo para primeras
              animationFillMode: 'both',
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Nota simple de cantidad */}
      {products.length > 20 && (
        <div className="text-center mt-10 pt-6 border-t border-slate-700/40">
          <p className="text-slate-400 text-sm">Mostrando {products.length} productos</p>
        </div>
      )}

      {/* ❌ Quitado el overlay fijo que provocaba repaints en móvil */}
    </div>
  );
};

export default ProductGrid;
