import React from "react";
import { ArrowRight, Sparkles, Package } from "lucide-react";
import { Link } from "react-router-dom";
import SpotlightCarousel from "./SpotlightCarousel";
import PhysicalProductsCarousel from "./PhysicalProductsCarousel";

interface HomeSectionProps {
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const HomeSection: React.FC<HomeSectionProps> = () => {
  return (
    <section className="relative min-h-screen lg:h-screen bg-[#F2F2F2] dark:bg-gray-900 lg:overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl lg:h-full lg:flex lg:flex-col">
        
        {/* Hero compacto - solo subtítulo */}
        <header className="text-center mb-3">
          <p className="text-[#595959] dark:text-gray-400 text-xs sm:text-sm max-w-xl mx-auto font-light">
            Cuentas de streaming y productos físicos seleccionados
          </p>
        </header>

        {/* Botones compactos */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <Link
            to="/streaming"
            className="group bg-white dark:bg-gray-800 hover:bg-[#0D0D0D] dark:hover:bg-gray-700 text-[#4CAF50] dark:text-[#66FF7A] hover:text-[#66FF7A] px-5 py-2.5 rounded-md font-medium transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(76,175,80,0.3)] dark:hover:shadow-[0_8px_24px_rgba(102,255,122,0.3)] flex items-center gap-2 border border-[#A6A6A6]/10 dark:border-gray-700/50 hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            Streaming
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/fisicos"
            className="group bg-white dark:bg-gray-800 hover:bg-[#0D0D0D] dark:hover:bg-gray-700 text-[#BA68C8] dark:text-[#CE93D8] hover:text-[#E1BEE7] px-5 py-2.5 rounded-md font-medium transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(186,104,200,0.3)] dark:hover:shadow-[0_8px_24px_rgba(206,147,216,0.3)] flex items-center gap-2 border border-[#A6A6A6]/10 dark:border-gray-700/50 hover:scale-105"
          >
            <Package className="w-4 h-4" />
            Físicos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => {
              const message =
                "Hola, me interesa registrarme como colaborador en Nova Store.\n\n" +
                "Quisiera recibir más información sobre cómo unirme y comenzar a vender productos.";
              const whatsappUrl = `https://wa.me/573027214125?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, "_blank");
            }}
            className="group bg-white dark:bg-gray-800 hover:bg-[#0D0D0D] dark:hover:bg-gray-700 text-[#4FC3F7] dark:text-[#81D4FA] hover:text-[#81D4FA] px-5 py-2.5 rounded-md font-medium transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(79,195,247,0.3)] dark:hover:shadow-[0_8px_24px_rgba(129,212,250,0.3)] flex items-center gap-2 border border-[#A6A6A6]/10 dark:border-gray-700/50 hover:scale-105"
          >
            <div className="w-4 h-4 bg-[#4FC3F7]/20 dark:bg-[#81D4FA]/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-[#4FC3F7] dark:bg-[#81D4FA] rounded-full"></div>
            </div>
            Colaborador
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Carruseles en grid 2 columnas (desktop) / 1 columna (mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 lg:flex-1 lg:overflow-y-auto lg:max-h-[calc(100vh-250px)]">
          
          {/* Streaming */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-6 bg-[#4CAF50] dark:bg-[#66FF7A] rounded-full shadow-lg"></div>
              <h2 className="text-lg lg:text-xl font-light text-[#0D0D0D] dark:text-white">
                Streaming
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition-shadow duration-300 border border-[#A6A6A6]/10 dark:border-gray-700/50">
              <SpotlightCarousel />
            </div>
          </div>

          {/* Productos físicos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-6 bg-[#BA68C8] dark:bg-[#CE93D8] rounded-full shadow-lg"></div>
              <h2 className="text-lg lg:text-xl font-light text-[#0D0D0D] dark:text-white">
                Productos Físicos
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition-shadow duration-300 border border-[#A6A6A6]/10 dark:border-gray-700/50">
              <PhysicalProductsCarousel />
            </div>
          </div>
        </div>

        {/* Footer compacto */}
        <footer className="mt-3 text-center py-2">
          <p className="text-[#A6A6A6] dark:text-gray-500 text-xs font-light">
            Diseñado con el ❤️ por <span className="text-[#595959] dark:text-gray-400">Davhumpf</span> · © 2025 Todos los derechos reservados
          </p>
        </footer>
      </div>
    </section>
  );
};

export default HomeSection;