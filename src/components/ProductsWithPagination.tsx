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
};

const ProductsWithPagination: React.FC<ProductsWithPaginationProps> = ({
  products,
  searchTerm,
  selectedCategory,
  onCategoryChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, products.length);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const hasSearchTerm = searchTerm?.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
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
                {products.length} producto(s) encontrado(s)
              </p>
            </div>
          </div>
        )}

        {currentProducts.length > 0 ? (
          <>
            {/* Contenedor con ancho máximo y centrado */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12 justify-items-center">
                {currentProducts.map((product, index) => (
                  <div
                    key={`${product.id}-${currentPage}`}
                    className="w-full max-w-[200px] animate-in fade-in slide-in-from-bottom-4"
                    style={{
                      animationDelay: `${Math.min(index * ANIMATION_DELAY_INCREMENT, 1)}s`,
                      animationFillMode: 'both',
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* Paginación corregida */}
            {totalPages > 1 && (
              <nav className="mt-6 md:mt-8">
                <ul className="mx-auto max-w-full flex flex-wrap items-center justify-center gap-2 md:gap-3 px-2">
                  <li>
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="h-9 px-3 rounded-lg text-sm bg-slate-800/60 border border-slate-700/50 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </li>

                  {pageNumbers.map((page, i) =>
                    page === '...' ? (
                      <li key={`d-${i}`} className="h-9 px-2 flex items-center text-slate-400 select-none shrink-0">
                        …
                      </li>
                    ) : (
                      <li key={page as number}>
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`h-9 min-w-[36px] px-3 rounded-lg text-sm shrink-0 ${
                            currentPage === page
                              ? 'bg-yellow-400 text-slate-900 border border-yellow-300'
                              : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 hover:bg-slate-700/60'
                          }`}
                          aria-label={`Ir a página ${(page as number).toString()}`}
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
                      className="h-9 px-3 rounded-lg text-sm bg-slate-800/60 border border-slate-700/50 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </li>
                </ul>

                <p className="text-center mt-4 text-slate-400 text-sm px-2">
                  Mostrando{' '}
                  <span className="text-yellow-400 font-semibold">
                    {startIndex + 1}-{endIndex}
                  </span>{' '}
                  de{' '}
                  <span className="text-yellow-400 font-semibold">{products.length}</span> productos
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
              {selectedCategory !== 'all' && (
                <button
                  onClick={handleShowAll}
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