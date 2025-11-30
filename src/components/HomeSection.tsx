import React from "react";
import { Package, Sparkles } from "lucide-react";
import ModernCarousel from "./ModernCarousel";

interface HomeSectionProps {
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const HomeSection: React.FC<HomeSectionProps> = ({ titleRef }) => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-purple-50/20 dark:from-[#0F0A1F] dark:via-[#1A1330] dark:to-[#0F0A1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Hero Minimalista */}
        <div className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto">
          <h1
            ref={titleRef}
            className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 dark:from-purple-400 dark:via-purple-300 dark:to-violet-400 bg-clip-text text-transparent mb-6 leading-tight"
          >
            Nova Store
          </h1>

          <p className="text-lg sm:text-xl text-purple-700/80 dark:text-purple-300/80 leading-relaxed max-w-2xl mx-auto">
            Tu tienda premium de cuentas de streaming y productos físicos.
            Calidad garantizada, precios inmejorables y entrega inmediata.
          </p>
        </div>

        {/* Carrusels Grid */}
        <div className="grid grid-cols-1 gap-12 lg:gap-16">
          <div className="bg-white/80 dark:bg-purple-950/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 border border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/5 dark:shadow-purple-500/10">
            <ModernCarousel
              type="streaming"
              title="Streaming Premium"
              icon={<Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
              linkTo="/streaming"
            />
          </div>

          <div className="bg-white/80 dark:bg-purple-950/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 border border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/5 dark:shadow-purple-500/10">
            <ModernCarousel
              type="physical"
              title="Productos Físicos"
              icon={<Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
              linkTo="/fisicos"
            />
          </div>
        </div>

        {/* Footer Minimalista */}
        <footer className="text-center py-8 mt-16 border-t border-purple-200/50 dark:border-purple-800/50">
          <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
            © 2025 Nova Store · Diseñado con <span className="text-red-500">❤️</span> por <span className="font-semibold">Davhumpf</span>
          </p>
        </footer>
      </div>
    </section>
  );
};

export default HomeSection;
