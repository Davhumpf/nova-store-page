// src/auth/AuthPage.tsx
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ⚡ Carga diferida para reducir el bundle inicial
const Login = React.lazy(() => import('./Login'));
const Register = React.lazy(() => import('./Register'));

const FallbackCard = () => (
  <div className="comic-panel halftone-pattern p-5">
    <div className="flex items-center gap-2 mb-4 relative z-10">
      <div className="w-6 h-6 rounded-full border-4 border-pop-cyan/30 border-t-pop-cyan animate-spin" />
      <span className="text-[#000] dark:text-[#FFF] text-sm font-bold">Cargando…</span>
    </div>
    <div className="space-y-3 relative z-10">
      <div className="h-10 comic-border bg-[#E8E8E8] dark:bg-[#333] animate-pulse" />
      <div className="h-10 comic-border bg-[#E8E8E8] dark:bg-[#333] animate-pulse" />
      <div className="h-11 comic-border bg-[#E8E8E8] dark:bg-[#333] animate-pulse" />
    </div>
  </div>
);

const AuthPage: React.FC = () => {
  const location = useLocation() as any;
  const navigate = useNavigate();

  const defaultMode: 'login' | 'register' =
    location.state?.defaultMode === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // 🔄 si te redirigen nuevamente con otro defaultMode, sincroniza el estado
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // 🚫 bloquear scroll mientras se está en AuthPage
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const handleAuthSuccess = useCallback(() => {
    const redirect = location.state?.redirect as string | undefined;

    if (redirect) {
      navigate(redirect, { replace: true });
      return;
    }
    if (location.state?.returnToCheckout) {
      navigate('/', { replace: true });
      return;
    }

    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  }, [location.state, navigate]);

  // Accesibilidad: tabs con teclado (← →)
  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setMode((m) => (m === 'login' ? 'register' : 'login'));
    }
  };

  const isRegister = mode === 'register';

  return (
    <main className="min-h-dvh grid place-items-center px-3 py-6 bg-gradient-to-br from-pop-pink/20 via-pop-cyan/20 to-pop-yellow/20 dark:from-pop-pink/10 dark:via-pop-cyan/10 dark:to-pop-yellow/10 crosshatch-pattern">
      <section className="w-full max-w-sm sm:max-w-md animate-comic-pop">
        <header className="text-center mb-6">
          <h1
            className="text-3xl sm:text-4xl font-black text-[#000] dark:text-[#FFF] comic-text-shadow uppercase tracking-tight"
            aria-live="polite"
          >
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="text-sm text-[#000] dark:text-[#FFF] font-bold mt-2 uppercase">
            {isRegister ? 'Regístrate para comenzar' : 'Accede a tu cuenta'}
          </p>
        </header>

        <div className="comic-panel halftone-pattern p-5 sm:p-6">
          {/* Tabs (segmented) accesibles */}
          <div
            role="tablist"
            aria-label="Seleccionar modo de autenticación"
            onKeyDown={onTabKeyDown}
            className="grid grid-cols-2 gap-2 mb-5 relative z-10"
          >
            <button
              role="tab"
              aria-selected={!isRegister}
              aria-controls="panel-login"
              onClick={() => setMode('login')}
              className={`py-3 text-sm font-black uppercase transition-all ${
                !isRegister
                  ? 'comic-border bg-pop-pink text-white dark:text-black'
                  : 'border-4 border-[#000] dark:border-[#FFF] bg-white dark:bg-[#1F1F1F] text-[#000] dark:text-[#FFF] hover:bg-[#F0F0F0] dark:hover:bg-[#2A2A2A]'
              }`}
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={isRegister}
              aria-controls="panel-register"
              onClick={() => setMode('register')}
              className={`py-3 text-sm font-black uppercase transition-all ${
                isRegister
                  ? 'comic-border bg-pop-pink text-white dark:text-black'
                  : 'border-4 border-[#000] dark:border-[#FFF] bg-white dark:bg-[#1F1F1F] text-[#000] dark:text-[#FFF] hover:bg-[#F0F0F0] dark:hover:bg-[#2A2A2A]'
              }`}
            >
              Registro
            </button>
          </div>

          {/* Contenido con transición suave */}
          <div className="relative z-10">
            <Suspense fallback={<FallbackCard />}>
              <div
                id={isRegister ? 'panel-register' : 'panel-login'}
                role="tabpanel"
                className="transition-all duration-200 data-[enter]:opacity-100 data-[enter]:translate-y-0 opacity-100 translate-y-0"
                data-enter
              >
                {isRegister ? (
                  <Register onSuccess={handleAuthSuccess} />
                ) : (
                  <Login onSuccess={handleAuthSuccess} />
                )}
              </div>
            </Suspense>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="comic-border bg-white dark:bg-[#1F1F1F] text-[#000] dark:text-[#FFF] px-6 py-2.5 text-sm font-black uppercase hover:bg-pop-yellow dark:hover:bg-pop-yellow hover:text-black transition-all"
          >
            ← Volver al inicio
          </button>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;