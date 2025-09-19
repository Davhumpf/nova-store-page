import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Search, Grid, List, Filter, X, SortAsc } from 'lucide-react';

interface ProductsWithPaginationProps {
  products: Product[];
  searchTerm: string;
  selectedCategory: string;
  onCategoryChange?: (category: string) => void;
  showCategoryButtons?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showFilters?: boolean;
  className?: string;
}

const PRODUCTS_PER_PAGE = 12;
const MAX_VISIBLE_PAGES = 5;
const ANIMATION_DELAY_INCREMENT = 0.05;

const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  all: 'Todos los productos',
  video: 'Video y Streaming',
  music: 'Música',
  gaming: 'Gaming',
  tools: 'Herramientas',
  education: 'Educación',
  productivity: 'Productividad',
  design: 'Diseño',
  business: 'Negocios',
  security: 'Seguridad',
  social: 'Redes Sociales',
  vpn: 'VPN',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes', icon: '🆕' },
  { value: 'price-low', label: 'Menor precio', icon: '💸' },
  { value: 'price-high', label: 'Mayor precio', icon: '💰' },
  { value: 'rating', label: 'Mejor valorados', icon: '⭐' },
  { value: 'popular', label: 'Más vendidos', icon: '🔥' },
  { value: 'name', label: 'Nombre A-Z', icon: '📝' },
];

const ProductsWithPagination: React.FC<ProductsWithPaginationProps> = ({
  products,
  searchTerm,
  selectedCategory,
  onCategoryChange,
  showCategoryButtons = true,
  viewMode = 'grid',
  onViewModeChange,
  showFilters = true,
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Función para ordenar productos
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      case 'price-low':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popular':
        return sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, sortedProducts.length);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [currentPage, totalPages]
  );

  const handlePrevPage = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  const handleShowAll = () => {
    onCategoryChange?.('all');
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setShowSortDropdown(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => setShowSortDropdown(false);
    if (showSortDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSortDropdown]);

  const hasSearchTerm = searchTerm?.trim();
  const currentSortOption = SORT_OPTIONS.find(opt => opt.value === sortBy);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header con información de búsqueda */}
        {hasSearchTerm && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg">
                  <Search className="w-5 h-5 text-slate-900" />
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-500">
                  Resultados para: "{searchTerm}"
                </h2>
              </div>
              <p className="text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {sortedProducts.length} producto(s) encontrado(s)
              </p>
            </div>
          </div>
        )}

        {/* Barra de herramientas */}
        {showFilters && sortedProducts.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Contador de productos */}
              <div className="text-slate-300 text-sm">
                <span className="font-semibold text-yellow-400">{sortedProducts.length}</span> productos
                {selectedCategory !== 'all' && (
                  <span className="ml-2 text-slate-400">
                    en {CATEGORY_DISPLAY_NAMES[selectedCategory] || selectedCategory}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Selector de ordenamiento */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortDropdown(!showSortDropdown);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-200 hover:bg-slate-700/60 transition-all duration-200"
                >
                  <SortAsc className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentSortOption?.label}</span>
                  <span className="sm:hidden">{currentSortOption?.icon}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-90' : ''}`} />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 py-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3 ${
                          sortBy === option.value ? 'bg-slate-700 text-yellow-400' : 'text-slate-200'
                        }`}
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selector de vista */}
              {onViewModeChange && (
                <div className="flex bg-slate-800/60 border border-slate-700/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => onViewModeChange('grid')}
                    className={`p-2 transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-yellow-400 text-slate-900'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                    }`}
                    aria-label="Vista de cuadrícula"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewModeChange('list')}
                    className={`p-2 transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-yellow-400 text-slate-900'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                    }`}
                    aria-label="Vista de lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentProducts.length > 0 ? (
          <>
            {/* Grid de productos */}
            <div className="max-w-7xl mx-auto">
              <div className={`grid gap-6 mb-12 justify-items-center ${
                viewMode === 'list'
                  ? 'grid-cols-1 max-w-4xl mx-auto'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              }`}>
                {currentProducts.map((product, index) => (
                  <div
                    key={`${product.id}-${currentPage}`}
                    className={`w-full animate-in fade-in slide-in-from-bottom-4 ${
                      viewMode === 'list' ? 'max-w-none' : 'max-w-[200px]'
                    }`}
                    style={{
                      animationDelay: `${Math.min(index * ANIMATION_DELAY_INCREMENT, 1)}s`,
                      animationFillMode: 'both',
                    }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <nav className="mt-8">
                <ul className="mx-auto max-w-full flex flex-wrap items-center justify-center gap-2 md:gap-3 px-2">
                  <li>
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="h-10 px-3 rounded-lg text-sm bg-slate-800/60 border border-slate-700/50 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors shrink-0"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </li>

                  {pageNumbers.map((page, i) =>
                    page === '...' ? (
                      <li key={`d-${i}`} className="h-10 px-2 flex items-center text-slate-400 select-none shrink-0">
                        …
                      </li>
                    ) : (
                      <li key={page as number}>
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`h-10 min-w-[40px] px-3 rounded-lg text-sm font-medium transition-all duration-200 shrink-0 ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 border border-yellow-300 shadow-lg shadow-yellow-400/25'
                              : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 hover:bg-slate-700/60 hover:border-slate-600/50'
                          }`}
                          aria-label={`Ir a página ${page}`}
                          aria-current={currentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}

                  <li>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-10 px-3 rounded-lg text-sm bg-slate-800/60 border border-slate-700/50 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors shrink-0"
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </li>
                </ul>

                <p className="text-center mt-6 text-slate-400 text-sm px-2">
                  Mostrando{' '}
                  <span className="text-yellow-400 font-semibold">
                    {startIndex + 1}-{endIndex}
                  </span>{' '}
                  de{' '}
                  <span className="text-yellow-400 font-semibold">{sortedProducts.length}</span> productos
                  {sortBy !== 'newest' && (
                    <span className="ml-2 text-slate-500">
                      • Ordenado por {currentSortOption?.label.toLowerCase()}
                    </span>
                  )}
                </p>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6 opacity-50" role="img" aria-label="Sin resultados">
                🔍
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-500 mb-3">
                No se encontraron productos
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                {searchTerm?.trim()
                  ? `No hay productos que coincidan con "${searchTerm}"`
                  : selectedCategory !== 'all'
                  ? `No hay productos en la categoría "${CATEGORY_DISPLAY_NAMES[selectedCategory] || 'Seleccionada'}"`
                  : 'No hay productos disponibles'}
              </p>
              {(selectedCategory !== 'all' || searchTerm?.trim()) && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={handleShowAll}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/25"
                    >
                      Ver todos los productos
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsWithPagination;