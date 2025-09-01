import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '../data/categories';

interface CategoryMenuProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ selectedCategory, onSelectCategory }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 150;
      direction === 'left' ? (current.scrollLeft -= scrollAmount) : (current.scrollLeft += scrollAmount);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="relative bg-gradient-to-r from-[#1F1B24] to-[#111111] py-2 shadow-lg">
      <div className="container mx-auto px-3 relative">
        {/* Left Arrow - Más compacto */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10 bg-[#111111]/90 backdrop-blur-sm rounded-full p-1.5 text-[#FEE440] hover:text-[#FFBA00] hover:scale-110 transition-all shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Categories - Más compactas */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar space-x-2 py-1.5 px-8 scroll-smooth"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`whitespace-nowrap py-1.5 px-4 rounded-full text-xs font-semibold backdrop-blur-sm transition-all duration-300 shadow-sm flex-shrink-0 ${
                selectedCategory === category.id
                  ? 'bg-[#FEE440] text-[#1F1B24] hover:bg-[#FFBA00] scale-105'
                  : 'bg-[#2A114B]/40 text-[#FEE440] hover:bg-[#FEE440]/20 hover:text-[#FFBA00] hover:scale-105'
              } active:scale-95`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Right Arrow - Más compacto */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 z-10 bg-[#111111]/90 backdrop-blur-sm rounded-full p-1.5 text-[#FEE440] hover:text-[#FFBA00] hover:scale-110 transition-all shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryMenu;