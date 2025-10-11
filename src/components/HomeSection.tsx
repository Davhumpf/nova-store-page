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
    <section className="relative min-h-screen lg:h-screen bg-[#E8E8E8] lg:overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 pt-4 pb-6 max-w-7xl lg:h-full lg:flex lg:flex-col lg:pt-0">
        
        {/* Botones compactos */}
        <div className="flex flex-wrap justify-center gap-2 mb-3 lg:mt-4">
          <Link
            to="/streaming"
            className="group bg-[#F5F5F5] hover:bg-[#0D0D0D] text-[#4CAF50] hover:text-[#66FF7A] px-5 py-2.5 rounded-md font-medium transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(76,175,80,0.25)] flex items-center gap-2 border border-[#D0D0D0] hover:border-transparent hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            Streaming
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/fisicos"
            className="group bg-[#F5F5F5] hover:bg-[#0D0D0D] text-[#BA68C8] hover:text-[#E1BEE7] px-5 py-2.5 rounded-md font-medium transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(186,104,200,0.25)] flex items-center gap-2 border border-[#D0D0D0] hover:border-transparent hover:scale-105"
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
            className="group bg-[#F5F5F5] hover:bg-[#0D0D0D] text-[#4FC3F7] hover:text-[#81D4FA] px-5 py-2.5 rounded-md font-medium transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(79,195,247,0.25)] flex items-center gap-2 border border-[#D0D0D0] hover:border-transparent hover:scale-105"
          >
            <div className="w-4 h-4 bg-[#4FC3F7]/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-[#4FC3F7] rounded-full"></div>
            </div>
            Colaborador
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Subtítulo descriptivo */}
        <header className="text-center mb-8">
          <p className="text-[#5A5A5A] text-xs sm:text-sm max-w-xl mx-auto font-light">
            Cuentas de streaming y productos físicos seleccionados
          </p>
        </header>

        {/* Carruseles en grid 2 columnas (desktop) / 1 columna (mobile) */}
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          
          {/* Streaming */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-6 bg-[#4CAF50] rounded-full shadow-sm"></div>
              <h2 className="text-lg lg:text-xl font-light text-[#2A2A2A]">
                Streaming
              </h2>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 border border-[#D0D0D0]">
              <SpotlightCarousel />
            </div>
          </div>

          {/* Productos físicos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-6 bg-[#BA68C8] rounded-full shadow-sm"></div>
              <h2 className="text-lg lg:text-xl font-light text-[#2A2A2A]">
                Productos Físicos
              </h2>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 border border-[#D0D0D0]">
              <PhysicalProductsCarousel />
            </div>
          </div>
        </div>
        </div>

        {/* Footer compacto */}
        <footer className="mt-6 text-center py-3">
          <p className="text-[#8A8A8A] text-xs font-light">
            Diseñado con el ❤️ por <span className="text-[#5A5A5A]">Davhumpf</span> · © 2025 Todos los derechos reservados
          </p>
        </footer>
      </div>
    </section>
  );
};

export default HomeSection;