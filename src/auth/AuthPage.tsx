// src/auth/AuthPage.tsx
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ⚡ Carga diferida para reducir el bundle inicial
const Login = React.lazy(() => import('./Login'));
const Register = React.lazy(() => import('./Register'));

const FallbackCard = () => (
  <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-5">
    <div className="flex items-center gap-2 mb-4 relative z-10">
      <div className="w-6 h-6 rounded-full border-4 border-black/30 dark:border-white/30 border-t-black dark:border-t-white animate-spin" />
      <span className="text-accent-primary font-bold text-sm">Cargando…</span>
    </div>
    <div className="space-y-3 relative z-10">
      <div className="h-10 border-2 border-black dark:border-white bg-white dark:bg-black animate-pulse" />
      <div className="h-10 border-2 border-black dark:border-white bg-white dark:bg-black animate-pulse" />
      <div className="h-11 border-2 border-black dark:border-white bg-white dark:bg-black animate-pulse" />
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
    <main className="min-h-dvh grid place-items-center px-3 py-6 bg-white dark:bg-black">
      <section className="w-full max-w-sm sm:max-w-md animate-scale-in">
        <header className="text-center mb-6">
          <h1
            className="text-3xl sm:text-4xl font-black text-[#000] dark:text-[#FFF] title-shadow uppercase tracking-tight"
            aria-live="polite"
          >
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="text-sm text-[#000] dark:text-[#FFF] font-bold mt-2 uppercase">
            {isRegister ? 'Regístrate para comenzar' : 'Accede a tu cuenta'}
          </p>
        </header>

        <div className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-classic-lg p-5 sm:p-6">
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
              className={`py-3 text-sm font-black uppercase transition-all border-4 ${
                !isRegister
                  ? 'border-black dark:border-white bg-white dark:bg-black text-accent-primary shadow-classic-md'
                  : 'border-black dark:border-white bg-white dark:bg-black text-[#000] dark:text-[#FFF] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)]'
              }`}
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={isRegister}
              aria-controls="panel-register"
              onClick={() => setMode('register')}
              className={`py-3 text-sm font-black uppercase transition-all border-4 ${
                isRegister
                  ? 'border-black dark:border-white bg-white dark:bg-black text-accent-primary shadow-classic-md'
                  : 'border-black dark:border-white bg-white dark:bg-black text-[#000] dark:text-[#FFF] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)]'
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
            className="border-4 border-black dark:border-white bg-white dark:bg-black text-[#000] dark:text-[#FFF] px-6 py-2.5 text-sm font-black uppercase hover:text-accent-primary transition-all shadow-classic-md"
          >
            ← Volver al inicio
          </button>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;