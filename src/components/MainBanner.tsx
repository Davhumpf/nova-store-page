import React, { useCallback } from 'react';
import { Grid, Filter, Music, Gamepad2, Wrench, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

interface MainBannerProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const CATEGORY_DATA = [
  { key: 'all', label: 'Todos', icon: Grid },
  { key: 'video', label: 'Video', icon: Sparkles },
  { key: 'music', label: 'Música', icon: Music },
  { key: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { key: 'tools', label: 'Herramientas', icon: Wrench },
  { key: 'productivity', label: 'Productividad', icon: BookOpen },
  { key: 'education', label: 'Educación', icon: GraduationCap }
];

const MainBanner: React.FC<MainBannerProps> = ({ selectedCategory = 'all', onCategoryChange }) => {

  // Componente de categoría optimizado
  const CategoryButton = React.memo(({ category, isSelected, onClick }: {
    category: typeof CATEGORY_DATA[0],
    isSelected: boolean,
    onClick: () => void
  }) => {
    const IconComponent = category.icon;

    return (
      <button
        onClick={onClick}
        className={`
          group relative px-4 py-2.5 font-medium text-sm
          transition-all duration-200 flex flex-col items-center gap-1.5
          min-w-[80px] lg:min-w-0 lg:w-full rounded-lg
          ${isSelected
            ? 'bg-accent-primary text-white shadow-classic-md'
            : 'bg-card border border-primary text-primary hover:border-secondary hover:shadow-classic-sm'
          }
        `}
      >
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {category.label}
        </span>
      </button>
    );
  });

  // Callback optimizado para cambio de categoría
  const handleCategoryChange = useCallback((categoryKey: string) => {
    onCategoryChange?.(categoryKey);
  }, [onCategoryChange]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="w-full">
        {/* Panel de categorías */}
        <div className="classic-container">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-accent-primary" />
            <h3 className="text-primary font-semibold text-base title-shadow">
              Filtrar por categoría
            </h3>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-7 gap-2">
              {CATEGORY_DATA.map((category) => (
                <CategoryButton
                  key={category.key}
                  category={category}
                  isSelected={selectedCategory === category.key}
                  onClick={() => handleCategoryChange(category.key)}
                />
              ))}
            </div>
          </div>

          {/* Mobile: Scroll horizontal */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mr-4 pr-4">
              {CATEGORY_DATA.map((category) => (
                <CategoryButton
                  key={category.key}
                  category={category}
                  isSelected={selectedCategory === category.key}
                  onClick={() => handleCategoryChange(category.key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
