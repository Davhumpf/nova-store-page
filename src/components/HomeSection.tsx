import React from "react";
import { ArrowRight, Sparkles, Package, Zap, TrendingUp, Star, Shield, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import ModernCarousel from "./ModernCarousel";

interface HomeSectionProps {
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const HomeSection: React.FC<HomeSectionProps> = ({ titleRef }) => {
  return (
    <section className="relative min-h-screen bg-secondary overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-success/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-7xl">
        {/* Hero Section - Modern & Elegant */}
        <div className="text-center mb-16 lg:mb-20 animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 shadow-classic-lg mb-8 border border-primary animate-scaleIn">
            <Zap className="w-4 h-4 text-accent-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary bg-gradient-to-r from-accent-primary to-accent-success bg-clip-text text-transparent">
              Tu Tienda Online Premium
            </span>
            <Sparkles className="w-4 h-4 text-accent-success" />
          </div>

          {/* Main Title */}
          <h1 ref={titleRef} className="text-5xl sm:text-6xl lg:text-7xl font-black text-primary mb-6 leading-tight px-4">
            Bienvenido a{" "}
            <span className="bg-gradient-to-r from-accent-primary via-accent-success to-accent-primary bg-clip-text text-transparent animate-pulse inline-block">
              Nova Store
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto leading-relaxed mb-12 px-4">
            Descubre las mejores cuentas de streaming y productos físicos premium.
            <br className="hidden sm:block" />
            <span className="font-semibold text-primary">Todo en un solo lugar</span>, con la mejor calidad y precios imbatibles.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12">
            <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-classic-xl hover:shadow-2xl transition-all duration-300 border border-primary hover:border-accent-success">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-accent-success/20 to-accent-success/10 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-accent-success" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">100%</h3>
              <p className="text-sm text-secondary font-medium">Compra Segura</p>
            </div>

            <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-classic-xl hover:shadow-2xl transition-all duration-300 border border-primary hover:border-accent-primary">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-accent-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">Mejores</h3>
              <p className="text-sm text-secondary font-medium">Precios del Mercado</p>
            </div>

            <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-classic-xl hover:shadow-2xl transition-all duration-300 border border-primary hover:border-accent-warning">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-accent-warning/20 to-accent-warning/10 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-8 h-8 text-accent-warning" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">Rápida</h3>
              <p className="text-sm text-secondary font-medium">Entrega Inmediata</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              to="/streaming"
              className="group relative px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-accent-primary to-accent-success hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden shadow-classic-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-success to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Explorar Streaming</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Link>

            <Link
              to="/fisicos"
              className="group px-8 py-4 rounded-xl font-semibold bg-white dark:bg-gray-900 text-primary hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-primary shadow-classic-xl"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-accent-primary" />
                <span>Ver Productos</span>
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
              className="group px-8 py-4 rounded-xl font-semibold bg-white dark:bg-gray-900 text-primary hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-accent-success shadow-classic-xl"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-2 bg-accent-success rounded-full animate-ping absolute"></div>
                  <div className="w-2 h-2 bg-accent-success rounded-full"></div>
                </div>
                <span>Ser Colaborador</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-accent-success" />
              </div>
            </button>
          </div>
        </div>

        {/* Modern Carousels */}
        <div className="space-y-16 lg:space-y-20 mb-16">
          {/* Streaming Carousel */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-classic-xl border border-primary">
            <ModernCarousel
              type="streaming"
              title="Streaming Premium"
              icon={<Sparkles className="w-6 h-6 text-accent-success" />}
              linkTo="/streaming"
            />
          </div>

          {/* Physical Products Carousel */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-classic-xl border border-primary">
            <ModernCarousel
              type="physical"
              title="Productos Físicos"
              icon={<Package className="w-6 h-6 text-accent-primary" />}
              linkTo="/fisicos"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-primary">
          <p className="text-sm text-secondary mb-2">
            Diseñado con{" "}
            <span className="text-accent-error animate-pulse">❤️</span>{" "}
            por{" "}
            <span className="font-bold text-primary">
              Davhumpf
            </span>
          </p>
          <p className="text-xs text-tertiary">
            © 2025 Nova Store. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default HomeSection;
