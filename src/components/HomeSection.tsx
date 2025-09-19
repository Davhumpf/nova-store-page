import React, { useEffect } from "react";
import { ArrowRight, Sparkles, Package } from "lucide-react";
import { Link } from "react-router-dom";
import SpotlightCarousel from "./SpotlightCarousel";
import PhysicalProductsCarousel from "./PhysicalProductsCarousel";

interface HomeSectionProps {
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const HomeSection: React.FC<HomeSectionProps> = ({ titleRef }) => {
  // ✅ Restaurar “título se va al header” con IntersectionObserver
  useEffect(() => {
    if (!titleRef?.current) return;

    const el = titleRef.current;
    const rootMargin = "0px 0px -60% 0px"; 
    // ^ dispara "stuck" un poco antes de salir completo (ajusta al gusto)

    const obs = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting;
        if (isVisible) {
          // título visible => quitar flag
          delete (document.documentElement as any).dataset.titleStuck;
        } else {
          // título fuera => poner flag para que el Header lo muestre "pegado"
          (document.documentElement as any).dataset.titleStuck = "true";
        }
      },
      { root: null, threshold: 0, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [titleRef]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400/15 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* 1) Hero: Título + subtítulo */}
        <header className="text-center mb-6 md:mb-8">
          <h1
            ref={titleRef}
            id="home-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-400 drop-shadow-lg animate-fadeIn mb-3"
          >
            Nova Store
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Tu destino para cuentas de streaming y productos físicos seleccionados
          </p>
        </header>

        {/* 2) Botones/CTAs */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 lg:mb-10">
          <Link
            to="/streaming"
            className="group bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/25 flex items-center gap-2 hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            Streaming
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/fisicos"
            className="group bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 hover:scale-105"
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
            className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-400/25 flex items-center gap-2 hover:scale-105"
          >
            <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            Ser colaborador
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3) Carruseles */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Streaming */}
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="bg-yellow-400/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                Streaming
              </h2>
            </div>
            <div className="animate-scaleIn">
              <SpotlightCarousel />
            </div>
          </div>

          {/* Productos físicos */}
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                Productos Físicos
              </h2>
            </div>
            <PhysicalProductsCarousel />
          </div>
        </div>

        {/* Footer / crédito */}
        <footer className="mt-12">
          <div className="text-center">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
              <p className="text-slate-400 text-sm">
                Diseñado por <span className="text-yellow-400 font-semibold">Ing Davhumpf</span> — © 2025
              </p>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default HomeSection;
