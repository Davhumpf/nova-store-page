import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface ProductsWithPaginationProps {
  products: Product[];
  searchTerm: string;
  selectedCategory: string;
  onCategoryChange?: (category: string) => void;
}

// Constantes extraídas para evitar recreación
const PRODUCTS_PER_PAGE = 30;
const MAX_VISIBLE_PAGES = 5;
const ANIMATION_DELAY_INCREMENT = 0.05;

// Mapeo de categorías optimizado y constante
const CATEGORY_MAP: { [key: string]: string[] } = {
  'video': ['video', 'streaming', 'netflix', 'prime', 'hbo', 'disney', 'youtube', 'tv'],
  'music': ['music', 'música', 'spotify', 'apple music', 'tidal', 'audio'],
  'gaming': ['gaming', 'games', 'game pass', 'xbox', 'playstation', 'nintendo'],
  'tools': ['tools', 'herramientas', 'software', 'utilities', 'canva', 'capcut'],
  'education': ['education', 'educación', 'duolingo', 'courses', 'learning', 'study'],
  'productivity': ['productivity', 'productividad', 'office', 'work', 'business']
};

const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  'all': 'Todos los productos',
  'video': 'Video y Streaming',
  'music': 'Música',
  'gaming': 'Gaming',
  'tools': 'Herramientas',
  'education': 'Educación',
  'productivity': 'Productividad'
};

const ProductsWithPagination: React.FC<ProductsWithPaginationProps> = ({ 
  products, 
  searchTerm, 
  selectedCategory,
  onCategoryChange 
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Función de filtrado optimizada con memoización
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    let filtered = products;

    // Filtrar por término de búsqueda primero (más restrictivo)
    if (searchTerm?.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const { name, description, category } = product;
        return (
          name.toLowerCase().includes(term) ||
          description.toLowerCase().includes(term) ||
          category.toLowerCase().includes(term)
        );
      });
    } else if (selectedCategory !== 'all') {
      // Solo filtrar por categoría si no hay búsqueda
      const categoryTerms = CATEGORY_MAP[selectedCategory];
      if (categoryTerms) {
        filtered = filtered.filter(product => {
          const searchText = `${product.category} ${product.name} ${product.description}`.toLowerCase();
          return categoryTerms.some(term => searchText.includes(term));
        });
      }
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Cálculos de paginación memoizados
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    return {
      totalPages,
      startIndex,
      currentProducts,
      endIndex: Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)
    };
  }, [filteredProducts, currentPage]);

  // Función para generar números de página optimizada
  const pageNumbers = useMemo(() => {
    const { totalPages } = paginationData;
    const pages: (number | string)[] = [];
    
    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, paginationData.totalPages]);

  // Handlers optimizados con useCallback
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= paginationData.totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, paginationData.totalPages]);

  const handlePrevPage = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  const handleResetFilters = useCallback(() => {
    onCategoryChange?.('all');
    window.location.href = '/';
  }, [onCategoryChange]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const { totalPages, startIndex, currentProducts, endIndex } = paginationData;
  const hasSearchTerm = searchTerm?.trim();
  const hasActiveFilters = hasSearchTerm || selectedCategory !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header de resultados de búsqueda optimizado */}
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
                {filteredProducts.length} producto(s) encontrado(s)
              </p>
            </div>
          </div>
        )}

        {/* Grid de productos o estado vacío */}
        {currentProducts.length > 0 ? (
          <>
            {/* Grid optimizado con animaciones staggered */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              {currentProducts.map((product, index) => (
                <div
                  key={`${product.id}-${currentPage}`}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{
                    animationDelay: `${Math.min(index * ANIMATION_DELAY_INCREMENT, 1)}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Paginación optimizada */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <div className="flex justify-center items-center gap-3">
                  
                  {/* Botón anterior */}
                  <button
                    className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-yellow-400 rounded-xl hover:from-yellow-400 hover:to-yellow-500 hover:text-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:from-slate-700/50 disabled:hover:to-slate-800/50 disabled:hover:text-yellow-400"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
                    <span className="ml-1 hidden sm:inline font-semibold">Anterior</span>
                  </button>

                  {/* Números de página */}
                  <div className="flex gap-2">
                    {pageNumbers.map((page, index) => {
                      const isActive = page === currentPage;
                      const isEllipsis = page === '...';
                      
                      return (
                        <button
                          key={`page-${index}-${page}`}
                          className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                            isActive
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 shadow-lg shadow-yellow-400/25'
                              : isEllipsis
                              ? 'text-slate-400 cursor-default hover:scale-100'
                              : 'bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-slate-300 hover:text-yellow-400 hover:border-yellow-400/30'
                          }`}
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          disabled={isEllipsis}
                          aria-label={typeof page === 'number' ? `Ir a página ${page}` : undefined}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón siguiente */}
                  <button
                    className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-yellow-400 rounded-xl hover:from-yellow-400 hover:to-yellow-500 hover:text-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:from-slate-700/50 disabled:hover:to-slate-800/50 disabled:hover:text-yellow-400"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                  >
                    <span className="mr-1 hidden sm:inline font-semibold">Siguiente</span>
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>

                {/* Información de página optimizada */}
                <div className="text-center mt-4 text-slate-400 text-sm">
                  Mostrando{' '}
                  <span className="text-yellow-400 font-semibold">
                    {startIndex + 1}-{endIndex}
                  </span>
                  {' '}de{' '}
                  <span className="text-yellow-400 font-semibold">
                    {filteredProducts.length}
                  </span>
                  {' '}productos
                </div>
              </div>
            )}
          </>
        ) : (
          // Estado vacío optimizado
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6 opacity-50" role="img" aria-label="Sin resultados">🔍</div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-500 mb-3">
                No se encontraron productos
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                {searchTerm?.trim()
                  ? `No hay productos que coincidan con "${searchTerm}"`
                  : selectedCategory !== 'all'
                  ? `No hay productos en la categoría "${CATEGORY_DISPLAY_NAMES[selectedCategory] || 'Seleccionada'}"`
                  : 'No hay productos disponibles'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/25"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsWithPagination;