import React from "react";
import { ArrowRight, Package, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ModernCarousel from "./ModernCarousel";

interface HomeSectionProps {
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const HomeSection: React.FC<HomeSectionProps> = ({ titleRef }) => {
  return (
    <section className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 mb-6">
            <Sparkles className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Tu Tienda Online Premium
            </span>
          </div>

          <h1
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 dark:text-stone-100 mb-6 leading-tight"
          >
            Bienvenido a Nova Store
          </h1>

          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 max-w-3xl mx-auto leading-relaxed mb-12">
            Descubre las mejores cuentas de streaming y productos físicos premium.
            <br className="hidden sm:block" />
            Todo en un solo lugar, con la mejor calidad y precios imbatibles.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1">100%</div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Compra Segura</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1">Mejores</div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Precios del Mercado</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1">Rápida</div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Entrega Inmediata</p>
            </div>
          </div>

          {/* CTA Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <Link
              to="/streaming"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors duration-150 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explorar Streaming</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/fisicos"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-stone-900 dark:text-stone-100 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors duration-150 shadow-sm"
            >
              <Package className="w-4 h-4" />
              <span>Ver Productos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                const message =
                  "Hola, me interesa registrarme como colaborador en Nova Store.\n\n" +
                  "Quisiera recibir más información sobre cómo unirme y comenzar a vender productos.";
                const whatsappUrl = `https://wa.me/573027214125?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, "_blank");
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-stone-900 dark:text-stone-100 bg-white dark:bg-zinc-900 border border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors duration-150 shadow-sm"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Ser Colaborador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousels Grid */}
        <div className="grid grid-cols-1 gap-12 lg:gap-16 mb-16">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-stone-200 dark:border-zinc-800 shadow-sm">
            <ModernCarousel
              type="streaming"
              title="Streaming Premium"
              icon={<Sparkles className="w-6 h-6 text-stone-600 dark:text-stone-400" />}
              linkTo="/streaming"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-stone-200 dark:border-zinc-800 shadow-sm">
            <ModernCarousel
              type="physical"
              title="Productos Físicos"
              icon={<Package className="w-6 h-6 text-stone-600 dark:text-stone-400" />}
              linkTo="/fisicos"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-stone-200 dark:border-zinc-800">
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
            Diseñado con <span className="text-red-500">❤️</span> por{" "}
            <span className="font-semibold text-stone-900 dark:text-stone-100">Davhumpf</span>
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500">
            © 2025 Nova Store. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default HomeSection;
