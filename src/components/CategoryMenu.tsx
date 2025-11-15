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
    <div className="relative halftone-pattern bg-gradient-to-r from-pop-purple/20 to-pop-blue/20 dark:from-gray-900 dark:to-gray-800 py-2 border-y-4 border-black dark:border-white">
      <div className="container mx-auto px-3 relative">
        {/* Left Arrow - Más compacto */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10 comic-button bg-pop-red text-white rounded-full p-1.5 hover:scale-110 transition-all"
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
              className={`whitespace-nowrap py-1.5 px-4 rounded-full text-xs font-bold backdrop-blur-sm transition-all duration-300 flex-shrink-0 uppercase ${
                selectedCategory === category.id
                  ? 'comic-button bg-pop-yellow text-[#0D0D0D] scale-105 animate-comic-pop'
                  : 'comic-border-light bg-white/80 dark:bg-gray-800/80 text-[#0D0D0D] dark:text-white hover:bg-pop-yellow/20 dark:hover:bg-pop-yellow/20 hover:scale-105'
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
            className="absolute right-1 top-1/2 transform -translate-y-1/2 z-10 comic-button bg-pop-red text-white rounded-full p-1.5 hover:scale-110 transition-all"
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