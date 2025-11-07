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
    <section className="relative min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#FAFAFA] to-[#F0F0F0] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#4CAF50]/10 dark:bg-[#66FF7A]/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#BA68C8]/10 dark:bg-[#CE93D8]/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#4FC3F7]/10 dark:bg-[#81D4FA]/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-[#4CAF50]/20 dark:border-[#66FF7A]/20 mb-6 shadow-lg">
            <Zap className="w-4 h-4 text-[#4CAF50] dark:text-[#66FF7A] animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-[#595959] dark:text-gray-300">
              Nueva Tienda Online
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0D0D0D] dark:text-white mb-4 leading-tight">
            Bienvenido a{" "}
            <span className="bg-gradient-to-r from-[#4CAF50] via-[#66FF7A] to-[#4CAF50] dark:from-[#66FF7A] dark:via-[#4CAF50] dark:to-[#66FF7A] bg-clip-text text-transparent animate-gradient">
              Nova Store
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#595959] dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Descubre las mejores cuentas de streaming y productos físicos premium.
            Todo en un solo lugar, con la mejor calidad y precios.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-[#A6A6A6]/10 dark:border-gray-700/50">
              <Star className="w-5 h-5 text-[#4CAF50] dark:text-[#66FF7A] fill-current" />
              <span className="text-sm font-semibold text-[#0D0D0D] dark:text-white">
                100% Seguro
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-[#A6A6A6]/10 dark:border-gray-700/50">
              <TrendingUp className="w-5 h-5 text-[#BA68C8] dark:text-[#CE93D8]" />
              <span className="text-sm font-semibold text-[#0D0D0D] dark:text-white">
                Mejores Precios
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-[#A6A6A6]/10 dark:border-gray-700/50">
              <Zap className="w-5 h-5 text-[#4FC3F7] dark:text-[#81D4FA]" />
              <span className="text-sm font-semibold text-[#0D0D0D] dark:text-white">
                Entrega Rápida
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons - Modern Design */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            to="/streaming"
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#4CAF50] to-[#66FF7A] text-white font-semibold text-base sm:text-lg shadow-[0_10px_40px_rgba(76,175,80,0.3)] dark:shadow-[0_10px_40px_rgba(102,255,122,0.2)] hover:shadow-[0_20px_60px_rgba(76,175,80,0.4)] dark:hover:shadow-[0_20px_60px_rgba(102,255,122,0.3)] transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#66FF7A] to-[#4CAF50] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>Explorar Streaming</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>

          <Link
            to="/fisicos"
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#BA68C8] to-[#CE93D8] text-white font-semibold text-base sm:text-lg shadow-[0_10px_40px_rgba(186,104,200,0.3)] dark:shadow-[0_10px_40px_rgba(206,147,216,0.2)] hover:shadow-[0_20px_60px_rgba(186,104,200,0.4)] dark:hover:shadow-[0_20px_60px_rgba(206,147,216,0.3)] transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#CE93D8] to-[#BA68C8] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
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
            className="group relative px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 text-[#4FC3F7] dark:text-[#81D4FA] font-semibold text-base sm:text-lg border-2 border-[#4FC3F7]/30 dark:border-[#81D4FA]/30 hover:border-[#4FC3F7] dark:hover:border-[#81D4FA] shadow-[0_10px_40px_rgba(79,195,247,0.2)] dark:shadow-[0_10px_40px_rgba(129,212,250,0.15)] hover:shadow-[0_20px_60px_rgba(79,195,247,0.3)] dark:hover:shadow-[0_20px_60px_rgba(129,212,250,0.25)] transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 bg-[#4FC3F7] dark:bg-[#81D4FA] rounded-full animate-ping absolute"></div>
                <div className="w-2 h-2 bg-[#4FC3F7] dark:bg-[#81D4FA] rounded-full"></div>
              </div>
              <span>Ser Colaborador</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* Products Grid - Modern Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Streaming Section */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4CAF50] via-[#66FF7A] to-[#4CAF50] rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-[#A6A6A6]/10 dark:border-gray-700/50 shadow-2xl dark:shadow-none">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#66FF7A] shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0D0D0D] dark:text-white">
                      Streaming
                    </h2>
                    <p className="text-sm text-[#595959] dark:text-gray-400">
                      Las mejores plataformas
                    </p>
                  </div>
                </div>
                <Link
                  to="/streaming"
                  className="text-[#4CAF50] dark:text-[#66FF7A] hover:underline text-sm font-medium flex items-center gap-1"
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
            <div className="absolute -inset-1 bg-gradient-to-r from-[#BA68C8] via-[#CE93D8] to-[#BA68C8] rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-[#A6A6A6]/10 dark:border-gray-700/50 shadow-2xl dark:shadow-none">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#BA68C8] to-[#CE93D8] shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0D0D0D] dark:text-white">
                      Productos Físicos
                    </h2>
                    <p className="text-sm text-[#595959] dark:text-gray-400">
                      Calidad garantizada
                    </p>
                  </div>
                </div>
                <Link
                  to="/fisicos"
                  className="text-[#BA68C8] dark:text-[#CE93D8] hover:underline text-sm font-medium flex items-center gap-1"
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

        {/* Footer */}
        <footer className="text-center py-6 border-t border-[#A6A6A6]/10 dark:border-gray-800">
          <p className="text-sm text-[#595959] dark:text-gray-400">
            Diseñado con{" "}
            <span className="text-red-500 animate-pulse">❤️</span>{" "}
            por{" "}
            <span className="font-semibold text-[#4CAF50] dark:text-[#66FF7A]">
              Davhumpf
            </span>
          </p>
          <p className="text-xs text-[#A6A6A6] dark:text-gray-500 mt-2">
            © 2025 Nova Store. Todos los derechos reservados.
          </p>
        </footer>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default HomeSection;
