// src/components/SidebarFilters.tsx
import React, { useState } from "react";
import { X, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { categories } from "../data/categories";

interface FilterState {
  category: string;
  priceRange: [number, number];
  minDiscount: number;
  inStock: boolean;
  rating: number;
}

interface SidebarFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  className?: string;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  className = ""
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    discount: true,
    availability: true,
    rating: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === categoryId ? "all" : categoryId
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: [min, max]
    });
  };

  const handleDiscountChange = (discount: number) => {
    onFiltersChange({
      ...filters,
      minDiscount: discount
    });
  };

  const handleStockChange = (inStock: boolean) => {
    onFiltersChange({
      ...filters,
      inStock
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating
    });
  };

  const FilterSection: React.FC<{
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }> = ({ title, section, children }) => (
    <div className="border-b-4 border-black dark:border-white/30 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent-primary/10 dark:hover:bg-accent-primary/10 transition-colors "
      >
        <span className="font-bold text-[#0D0D0D] dark:text-white title-shadow uppercase">{title}</span>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-accent-error dark:text-accent-primary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-accent-error dark:text-accent-primary" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="px-4 pb-4 space-y-3 bg-accent-primary/5 dark:bg-accent-primary/5">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static top-0 right-0 h-full lg:h-auto
          w-80 lg:w-72 xl:w-80 bg-white dark:bg-gray-900
          border border-primary rounded-lg           z-50 lg:z-0 transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          overflow-y-auto rounded-l-2xl lg:rounded-2xl filters-sidebar
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-white  bg-white dark:bg-black">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-bold text-black dark:text-white title-shadow uppercase">Filtros</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearFilters}
              className="text-sm text-[#0D0D0D] dark:text-white hover:text-accent-error dark:hover:text-accent-primary transition-colors font-bold uppercase"
            >
              Limpiar
            </button>
            <button
              onClick={onClose}
              className="lg:hidden text-[#0D0D0D] dark:text-white hover:text-accent-error dark:hover:text-accent-primary transition-colors p-1 classic-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Content */}
        <div className="divide-y divide-slate-600/30">
          {/* Categories */}
          <FilterSection title="Categorías" section="category">
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === "all"}
                  onChange={() => handleCategoryChange("all")}
                  className="w-4 h-4 text-yellow-400 bg-slate-700 border-slate-600 focus:ring-yellow-400"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  Todas las categorías
                </span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-yellow-400 bg-slate-700 border-slate-600 focus:ring-yellow-400"
                  />
                  <span className="text-slate-300 group-hover:text-white transition-colors text-sm">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Rango de precio" section="price">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(parseInt(e.target.value) || 0, filters.priceRange[1])}
                    className="w-full classic-input text-sm text-[#0D0D0D] dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Máximo</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(filters.priceRange[0], parseInt(e.target.value) || 1000)}
                    className="w-full classic-input text-sm text-[#0D0D0D] dark:text-white"
                    placeholder="1000"
                  />
                </div>
              </div>
              
              {/* Quick Price Filters */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Hasta $10", max: 10 },
                  { label: "Hasta $25", max: 25 },
                  { label: "Hasta $50", max: 50 },
                  { label: "Hasta $100", max: 100 }
                ].map((range) => (
                  <button
                    key={range.max}
                    onClick={() => handlePriceRangeChange(0, range.max)}
                    className={`
                      text-xs py-2 px-3 rounded-lg font-bold transition-colors uppercase
                      ${filters.priceRange[0] === 0 && filters.priceRange[1] === range.max
                        ? 'classic-btn bg-white dark:bg-black border-2 border-black dark:border-white text-accent-primary shadow-classic-md'
                        : 'border border-primary rounded-lg-light bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Discount */}
          <FilterSection title="Descuentos" section="discount">
            <div className="space-y-2">
              {[
                { label: "Sin filtro", value: 0 },
                { label: "10% o más", value: 10 },
                { label: "25% o más", value: 25 },
                { label: "50% o más", value: 50 },
                { label: "75% o más", value: 75 }
              ].map((discount) => (
                <label key={discount.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="discount"
                    checked={filters.minDiscount === discount.value}
                    onChange={() => handleDiscountChange(discount.value)}
                    className="w-4 h-4 text-yellow-400 bg-slate-700 border-slate-600 focus:ring-yellow-400"
                  />
                  <span className="text-slate-300 group-hover:text-white transition-colors text-sm">
                    {discount.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Availability */}
          <FilterSection title="Disponibilidad" section="availability">
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleStockChange(e.target.checked)}
                  className="w-4 h-4 text-yellow-400 bg-slate-700 border-slate-600 rounded focus:ring-yellow-400"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors text-sm">
                  Solo productos disponibles
                </span>
              </label>
            </div>
          </FilterSection>

          {/* Rating */}
          <FilterSection title="Valoración mínima" section="rating">
            <div className="space-y-2">
              {[
                { label: "Sin filtro", value: 0 },
                { label: "1 estrella o más", value: 1 },
                { label: "2 estrellas o más", value: 2 },
                { label: "3 estrellas o más", value: 3 },
                { label: "4 estrellas o más", value: 4 },
                { label: "5 estrellas", value: 5 }
              ].map((rating) => (
                <label key={rating.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === rating.value}
                    onChange={() => handleRatingChange(rating.value)}
                    className="w-4 h-4 text-yellow-400 bg-slate-700 border-slate-600 focus:ring-yellow-400"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-slate-300 group-hover:text-white transition-colors text-sm">
                      {rating.label}
                    </span>
                    {rating.value > 0 && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rating.value }).map((_, i) => (
                          <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        ))}
                        {rating.value < 5 && Array.from({ length: 5 - rating.value }).map((_, i) => (
                          <div key={i} className="w-3 h-3 bg-slate-600 rounded-full"></div>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Active Filters Summary */}
          {(filters.category !== "all" || 
            filters.priceRange[0] !== 0 || 
            filters.priceRange[1] !== 1000 || 
            filters.minDiscount !== 0 || 
            filters.inStock || 
            filters.rating !== 0) && (
            <div className="p-4 bg-white dark:bg-black border-t-4 border-black dark:border-white ">
              <h4 className="text-sm font-bold text-[#0D0D0D] dark:text-white mb-3 title-shadow uppercase">Filtros activos:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.category !== "all" && (
                  <span className="inline-flex items-center gap-1 border border-primary rounded-lg-light bg-white dark:bg-black border-2 border-black dark:border-white text-accent-primary text-xs px-2 py-1 rounded-full font-bold">
                    {categories.find(c => c.id === filters.category)?.name || filters.category}
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className="hover:text-accent-error dark:hover:text-accent-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) && (
                  <span className="inline-flex items-center gap-1 border border-primary rounded-lg-light bg-white dark:bg-black border-2 border-black dark:border-white text-accent-primary text-xs px-2 py-1 rounded-full font-bold">
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    <button
                      onClick={() => handlePriceRangeChange(0, 1000)}
                      className="hover:text-accent-error dark:hover:text-accent-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.minDiscount > 0 && (
                  <span className="inline-flex items-center gap-1 border border-primary rounded-lg-light bg-white dark:bg-black border-2 border-black dark:border-white text-accent-primary text-xs px-2 py-1 rounded-full font-bold">
                    {filters.minDiscount}% descuento
                    <button
                      onClick={() => handleDiscountChange(0)}
                      className="hover:text-accent-error dark:hover:text-accent-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.inStock && (
                  <span className="inline-flex items-center gap-1 border border-primary rounded-lg-light bg-white dark:bg-black border-2 border-black dark:border-white text-accent-success text-xs px-2 py-1 rounded-full font-bold">
                    En stock
                    <button
                      onClick={() => handleStockChange(false)}
                      className="hover:text-accent-error dark:hover:text-accent-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.rating > 0 && (
                  <span className="inline-flex items-center gap-1 border border-primary rounded-lg-light bg-white dark:bg-black border-2 border-black dark:border-white text-accent-primary text-xs px-2 py-1 rounded-full font-bold">
                    {filters.rating}+ estrellas
                    <button
                      onClick={() => handleRatingChange(0)}
                      className="hover:text-accent-error dark:hover:text-accent-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Apply Button - Mobile */}
        <div className="p-4 lg:hidden border-t-4 border-black dark:border-white">
          <button
            onClick={onClose}
            className="w-full classic-btn bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white py-3 rounded-xl font-bold transition-colors uppercase shadow-classic-lg"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarFilters;