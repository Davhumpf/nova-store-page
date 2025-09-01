import React, { useMemo, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface ProductsWithPaginationProps {
  products: Product[];
  searchTerm: string;
  selectedCategory: string;
  onCategoryChange?: (category: string) => void;
}

const ProductsWithPagination: React.FC<ProductsWithPaginationProps> = ({ 
  products, 
  searchTerm, 
  selectedCategory,
  onCategoryChange 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 30;

  // Reset page when search term or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term first if exists
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    } else {
      // Only filter by category if there's no search term
      if (selectedCategory !== 'all') {
        // Mapear las categorías del MainBanner a las categorías de los productos
        const categoryMap: { [key: string]: string[] } = {
          'video': ['video', 'streaming', 'netflix', 'prime', 'hbo', 'disney', 'youtube', 'tv'],
          'music': ['music', 'música', 'spotify', 'apple music', 'tidal', 'audio'],
          'gaming': ['gaming', 'games', 'game pass', 'xbox', 'playstation', 'nintendo'],
          'tools': ['tools', 'herramientas', 'software', 'utilities', 'canva', 'capcut'],
          'education': ['education', 'educación', 'duolingo', 'courses', 'learning', 'study'],
          'productivity': ['productivity', 'productividad', 'office', 'work', 'business']
        };

        if (categoryMap[selectedCategory]) {
          filtered = filtered.filter(product => 
            categoryMap[selectedCategory].some(cat => 
              product.category.toLowerCase().includes(cat) ||
              product.name.toLowerCase().includes(cat) ||
              product.description.toLowerCase().includes(cat)
            )
          );
        }
      }
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (start > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      
      if (end < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'all': 'Todos los productos',
      'video': 'Video y Streaming',
      'music': 'Música',
      'gaming': 'Gaming',
      'tools': 'Herramientas',
      'education': 'Educación',
      'productivity': 'Productividad'
    };
    return categoryMap[category] || 'Productos';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Search results header */}
        {searchTerm && searchTerm.trim() && (
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
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {filteredProducts.length} producto(s) encontrado(s)
              </p>
            </div>
          </div>
        )}

        {/* Products grid */}
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              {currentProducts.map((product, index) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <div className="flex justify-center items-center gap-3">
                  <button
                    className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-yellow-400 rounded-xl hover:from-yellow-400 hover:to-yellow-500 hover:text-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:from-slate-700/50 disabled:hover:to-slate-800/50 disabled:hover:text-yellow-400"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
                    <span className="ml-1 hidden sm:inline font-semibold">Anterior</span>
                  </button>

                  <div className="flex gap-2">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 shadow-lg shadow-yellow-400/25'
                            : page === '...'
                            ? 'text-slate-400 cursor-default hover:scale-100'
                            : 'bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-slate-300 hover:text-yellow-400 hover:border-yellow-400/30'
                        }`}
                        onClick={() => {
                          if (typeof page === 'number') {
                            handlePageChange(page);
                          }
                        }}
                        disabled={page === '...'}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-yellow-400 rounded-xl hover:from-yellow-400 hover:to-yellow-500 hover:text-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:from-slate-700/50 disabled:hover:to-slate-800/50 disabled:hover:text-yellow-400"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span className="mr-1 hidden sm:inline font-semibold">Siguiente</span>
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>

                {/* Page info */}
                <div className="text-center mt-4 text-slate-400 text-sm">
                  Mostrando <span className="text-yellow-400 font-semibold">{startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)}</span> de <span className="text-yellow-400 font-semibold">{filteredProducts.length}</span> productos
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6 opacity-50">🔍</div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-500 mb-3">
                No se encontraron productos
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                {searchTerm && searchTerm.trim()
                  ? `No hay productos que coincidan con "${searchTerm}"`
                  : selectedCategory !== 'all'
                  ? `No hay productos en la categoría "${getCategoryDisplayName(selectedCategory)}"`
                  : 'No hay productos disponibles'
                }
              </p>
              {(searchTerm && searchTerm.trim()) || selectedCategory !== 'all' ? (
                <button
                  onClick={() => {
                    if (onCategoryChange) {
                      onCategoryChange('all');
                    }
                    window.location.href = '/';
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/25"
                >
                  Ver todos los productos
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsWithPagination;