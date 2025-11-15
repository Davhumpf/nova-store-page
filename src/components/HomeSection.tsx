import React from "react";
import { ArrowRight, Sparkles, Package, Zap, TrendingUp, Star } from "lucide-react";
import { Link } from "react-router-dom";
import SpotlightCarousel from "./SpotlightCarousel";
import PhysicalProductsCarousel from "./PhysicalProductsCarousel";

interface HomeSectionProps {
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const HomeSection: React.FC<HomeSectionProps> = () => {
  return (
    <section className="relative min-h-screen bg-pop-yellow dark:bg-gray-900 overflow-hidden">
      {/* Comic background effects with patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Crosshatch pattern overlay */}
        <div className="absolute inset-0 crosshatch-pattern text-gray-900 dark:text-white"></div>

        {/* Pop art color blobs with comic borders */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-pop-cyan dark:bg-pop-cyan comic-border-light rounded-full opacity-30 dark:opacity-20"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pop-pink dark:bg-pop-pink comic-border-light rounded-full opacity-30 dark:opacity-20"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pop-green dark:bg-pop-green comic-border-light rounded-full opacity-30 dark:opacity-20"></div>

        {/* Halftone pattern overlay */}
        <div className="absolute inset-0 halftone-pattern text-gray-900 dark:text-white"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Hero Section with Comic Panel */}
        <div className="text-center mb-8 sm:mb-12 comic-panel halftone-pattern p-8 rounded-3xl animate-comic-pop">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pop-orange border-4 border-black dark:border-white mb-6 shadow-lg speed-lines">
            <Zap className="w-4 h-4 text-black dark:text-white animate-pulse relative z-10" />
            <span className="text-xs sm:text-sm font-bold text-black dark:text-white uppercase tracking-wide relative z-10">
              Nueva Tienda Online
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black dark:text-white mb-4 leading-tight comic-text-outline">
            Bienvenido a{" "}
            <span className="text-pop-red dark:text-pop-cyan comic-text-shadow animate-comic-bounce inline-block">
              Nova Store
            </span>
          </h1>

          <p className="text-base sm:text-lg text-black dark:text-white max-w-2xl mx-auto font-bold leading-relaxed">
            Descubre las mejores cuentas de streaming y productos físicos premium.
            Todo en un solo lugar, con la mejor calidad y precios.
          </p>

          {/* Stats with comic styling */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pop-green border-3 border-black dark:border-white comic-hover bendaydots-pattern">
              <Star className="w-5 h-5 text-black dark:text-white fill-current" />
              <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
                100% Seguro
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pop-purple border-3 border-black dark:border-white comic-hover bendaydots-pattern">
              <TrendingUp className="w-5 h-5 text-black dark:text-white" />
              <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
                Mejores Precios
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pop-cyan border-3 border-black dark:border-white comic-hover bendaydots-pattern">
              <Zap className="w-5 h-5 text-black dark:text-white" />
              <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
                Entrega Rápida
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons - Comic Style */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            to="/streaming"
            className="comic-button bg-pop-green hover:animate-comic-bounce rounded-xl animate-comic-pop overflow-hidden speed-lines-right"
          >
            <div className="relative flex items-center gap-3 z-10">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>Explorar Streaming</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>

          <Link
            to="/fisicos"
            className="comic-button bg-pop-pink hover:animate-comic-bounce rounded-xl animate-comic-pop overflow-hidden speed-lines-right"
          >
            <div className="relative flex items-center gap-3 z-10">
              <Package className="w-5 h-5" />
              <span>Ver Productos</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>

          <button
            onClick={() => {
              const message =
                "Hola, me interesa registrarme como colaborador en Nova Store.\n\n" +
                "Quisiera recibir más información sobre cómo unirme y comenzar a vender productos.";
              const whatsappUrl = `https://wa.me/573027214125?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, "_blank");
            }}
            className="comic-button bg-pop-cyan hover:animate-comic-bounce rounded-xl animate-comic-pop overflow-hidden speed-lines"
          >
            <div className="relative flex items-center gap-3 z-10">
              <div className="relative">
                <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-ping absolute"></div>
                <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>
              </div>
              <span>Ser Colaborador</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* Products Grid - Comic Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Streaming Section */}
          <div className="group relative">
            <div className="relative comic-panel rounded-2xl p-6 stipple-pattern bg-white dark:bg-gray-800 comic-hover">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-pop-green border-3 border-black dark:border-white comic-border-light">
                    <Sparkles className="w-6 h-6 text-black dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black dark:text-white comic-text-outline">
                      Streaming
                    </h2>
                    <p className="text-sm text-black dark:text-white font-bold">
                      Las mejores plataformas
                    </p>
                  </div>
                </div>
                <Link
                  to="/streaming"
                  className="text-pop-red dark:text-pop-cyan hover:underline text-sm font-bold flex items-center gap-1 uppercase tracking-wide"
                >
                  Ver todo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Carousel */}
              <SpotlightCarousel />
            </div>
          </div>

          {/* Physical Products Section */}
          <div className="group relative">
            <div className="relative comic-panel rounded-2xl p-6 stipple-pattern bg-white dark:bg-gray-800 comic-hover">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-pop-purple border-3 border-black dark:border-white comic-border-light">
                    <Package className="w-6 h-6 text-black dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black dark:text-white comic-text-outline">
                      Productos Físicos
                    </h2>
                    <p className="text-sm text-black dark:text-white font-bold">
                      Calidad garantizada
                    </p>
                  </div>
                </div>
                <Link
                  to="/fisicos"
                  className="text-pop-red dark:text-pop-pink hover:underline text-sm font-bold flex items-center gap-1 uppercase tracking-wide"
                >
                  Ver todo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Carousel */}
              <PhysicalProductsCarousel />
            </div>
          </div>
        </div>

        {/* Footer - Comic Style */}
        <footer className="text-center py-6 border-t-4 border-black dark:border-white comic-panel rounded-2xl p-4">
          <p className="text-sm text-black dark:text-white font-bold">
            Diseñado con{" "}
            <span className="text-pop-red animate-pulse">❤️</span>{" "}
            por{" "}
            <span className="font-black text-pop-green dark:text-pop-cyan comic-text-shadow">
              Davhumpf
            </span>
          </p>
          <p className="text-xs text-black dark:text-white mt-2 font-semibold">
            © 2025 Nova Store. Todos los derechos reservados.
          </p>
        </footer>
      </div>

    </section>
  );
};

export default HomeSection;
