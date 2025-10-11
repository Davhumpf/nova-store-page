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
      <div className="relative flex-shrink-0">
        <button
          onClick={onClick}
          className={`group relative px-4 py-3 font-medium text-sm transition-all duration-300 flex flex-col items-center gap-1.5 min-w-[80px] lg:min-w-0 lg:w-full ${
            isSelected
              ? 'bg-gradient-to-b from-[#FEE440] via-[#FEE440] to-transparent dark:from-[#4CAF50] dark:via-[#4CAF50] text-black dark:text-white shadow-lg shadow-[#FEE440]/30 dark:shadow-[#4CAF50]/30 transform scale-105'
              : 'bg-gradient-to-b from-white/5 via-white/5 to-transparent dark:from-gray-700/50 dark:via-gray-700/30 text-white/80 dark:text-gray-300 hover:from-white/10 hover:via-white/10 dark:hover:from-gray-600/50 dark:hover:via-gray-600/30 hover:to-transparent hover:text-white hover:shadow-lg border-b border-white/10 dark:border-gray-600/30 hover:border-[#FEE440]/50 dark:hover:border-[#4CAF50]/50'
          } rounded-t-2xl border-t border-l border-r ${
            isSelected 
              ? 'border-[#FEE440]/50 dark:border-[#4CAF50]/50' 
              : 'border-white/10 dark:border-gray-600/30 hover:border-[#FEE440]/30 dark:hover:border-[#4CAF50]/30'
          }`}
          style={{
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
            borderBottom: 'none'
          }}
        >
          <IconComponent className={`w-4 h-4 ${isSelected ? '' : 'group-hover:text-[#FEE440] dark:group-hover:text-[#66FF7A]'} transition-colors flex-shrink-0`} />
          <span className="text-xs leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full lg:block">
            {category.label}
          </span>
          {isSelected && (
            <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-[#FEE440]/20 dark:from-[#4CAF50]/20 via-[#FEE440]/10 dark:via-[#4CAF50]/10 to-transparent animate-pulse pointer-events-none" />
          )}
        </button>
        
        <div 
          className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
            isSelected 
              ? 'bg-gradient-to-r from-transparent via-[#FEE440] dark:via-[#4CAF50] to-transparent' 
              : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-white/30 dark:group-hover:via-gray-400/30 group-hover:to-transparent'
          }`}
          style={{ 
            transform: 'translateY(1px)',
            zIndex: 10
          }}
        />
      </div>
    );
  });

  // Callback optimizado para cambio de categoría
  const handleCategoryChange = useCallback((categoryKey: string) => {
    onCategoryChange?.(categoryKey);
  }, [onCategoryChange]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="w-full">
        {/* Solo categorías */}
        <div className="bg-black/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-gray-700/50 shadow-2xl dark:shadow-gray-950/50 h-48 overflow-hidden">
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
              <Filter className="w-5 h-5 text-[#FEE440] dark:text-[#66FF7A]" />
              <h3 className="text-white dark:text-gray-100 font-semibold text-base">Filtrar por categoría</h3>
            </div>
            
            <div className="flex-1">
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
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mr-6 pr-6">
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
      </div>

      {/* CSS para scroll horizontal */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MainBanner;