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
    <section className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
      {/* Comic background effects with patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Crosshatch pattern overlay */}
        <div className="absolute inset-0  text-gray-900 dark:text-white opacity-5"></div>

        {/* Halftone pattern overlay */}
        <div className="absolute inset-0  text-gray-900 dark:text-white opacity-5"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Hero Section with Comic Panel */}
        <div className="text-center mb-8 sm:mb-12 classic-card  p-8 rounded-3xl animate-scale-in bg-white dark:bg-black border-4 border-black dark:border-white shadow-classic-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-black border-4 border-black dark:border-white mb-6 shadow-classic-lg ">
            <Zap className="w-4 h-4 text-accent-primary animate-pulse relative z-10" />
            <span className="text-xs sm:text-sm font-bold text-accent-primary uppercase tracking-wide relative z-10">
              Nueva Tienda Online
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black dark:text-white mb-4 leading-tight ">
            Bienvenido a{" "}
            <span className="text-accent-error dark:text-accent-primary title-shadow  inline-block">
              Nova Store
            </span>
          </h1>

          <p className="text-base sm:text-lg text-black dark:text-white max-w-2xl mx-auto font-bold leading-relaxed">
            Descubre las mejores cuentas de streaming y productos físicos premium.
            Todo en un solo lugar, con la mejor calidad y precios.
          </p>

          {/* Stats with comic styling */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-black border-3 border-black dark:border-white transition-all duration-200 hover:shadow-classic-md  shadow-classic-md">
              <Star className="w-5 h-5 text-accent-success fill-current" />
              <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
                100% Seguro
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-black border-3 border-black dark:border-white transition-all duration-200 hover:shadow-classic-md  shadow-classic-md">
              <TrendingUp className="w-5 h-5 text-accent-primary" />
              <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
                Mejores Precios
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-black border-3 border-black dark:border-white transition-all duration-200 hover:shadow-classic-md  shadow-classic-md">
              <Zap className="w-5 h-5 text-accent-primary" />
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
            className="classic-btn bg-white dark:bg-black hover: rounded-xl animate-scale-in overflow-hidden  border-4 border-black dark:border-white shadow-classic-lg"
          >
            <div className="relative flex items-center gap-3 z-10">
              <Sparkles className="w-5 h-5 animate-pulse text-accent-success" />
              <span className="text-black dark:text-white">Explorar Streaming</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-accent-success" />
            </div>
          </Link>

          <Link
            to="/fisicos"
            className="classic-btn bg-white dark:bg-black hover: rounded-xl animate-scale-in overflow-hidden  border-4 border-black dark:border-white shadow-classic-lg"
          >
            <div className="relative flex items-center gap-3 z-10">
              <Package className="w-5 h-5 text-accent-primary" />
              <span className="text-black dark:text-white">Ver Productos</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-accent-primary" />
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
            className="classic-btn bg-white dark:bg-black hover: rounded-xl animate-scale-in overflow-hidden  border-4 border-black dark:border-white shadow-classic-lg"
          >
            <div className="relative flex items-center gap-3 z-10">
              <div className="relative">
                <div className="w-2 h-2 bg-accent-primary rounded-full animate-ping absolute"></div>
                <div className="w-2 h-2 bg-accent-primary rounded-full"></div>
              </div>
              <span className="text-black dark:text-white">Ser Colaborador</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-accent-primary" />
            </div>
          </button>
        </div>

        {/* Products Grid - Comic Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Streaming Section */}
          <div className="group relative">
            <div className="relative classic-card rounded-2xl p-6  bg-white dark:bg-black transition-all duration-200 hover:shadow-classic-md border-4 border-black dark:border-white shadow-classic-lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-black border-3 border-black dark:border-white border border-primary rounded-lg shadow-classic-md">
                    <Sparkles className="w-6 h-6 text-accent-success" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black dark:text-white ">
                      Streaming
                    </h2>
                    <p className="text-sm text-black dark:text-white font-bold">
                      Las mejores plataformas
                    </p>
                  </div>
                </div>
                <Link
                  to="/streaming"
                  className="text-accent-error dark:text-accent-primary hover:underline text-sm font-bold flex items-center gap-1 uppercase tracking-wide"
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
            <div className="relative classic-card rounded-2xl p-6  bg-white dark:bg-black transition-all duration-200 hover:shadow-classic-md border-4 border-black dark:border-white shadow-classic-lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-black border-3 border-black dark:border-white border border-primary rounded-lg shadow-classic-md">
                    <Package className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black dark:text-white ">
                      Productos Físicos
                    </h2>
                    <p className="text-sm text-black dark:text-white font-bold">
                      Calidad garantizada
                    </p>
                  </div>
                </div>
                <Link
                  to="/fisicos"
                  className="text-accent-error dark:text-accent-primary hover:underline text-sm font-bold flex items-center gap-1 uppercase tracking-wide"
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
        <footer className="text-center py-6 border-t-4 border-black dark:border-white classic-card rounded-2xl p-4 bg-white dark:bg-black shadow-classic-lg">
          <p className="text-sm text-black dark:text-white font-bold">
            Diseñado con{" "}
            <span className="text-accent-error animate-pulse">❤️</span>{" "}
            por{" "}
            <span className="font-black text-accent-success dark:text-accent-primary title-shadow">
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
