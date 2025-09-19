// src/auth/AuthPage.tsx
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ⚡ Carga diferida para reducir el bundle inicial (mantiene props/onSuccess)
const Login = React.lazy(() => import('./Login'));
const Register = React.lazy(() => import('./Register'));

const FallbackCard = () => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
      <span className="text-slate-300 text-sm">Cargando…</span>
    </div>
    <div className="space-y-3">
      <div className="h-9 rounded-lg bg-slate-700/50 animate-pulse" />
      <div className="h-9 rounded-lg bg-slate-700/50 animate-pulse" />
      <div className="h-10 rounded-lg bg-slate-700/50 animate-pulse" />
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
    // Soporta ambos flags que usas en el proyecto:
    // 1) { returnToCheckout: true }  -> vuelve al inicio (conservado tal cual lo tenías)
    // 2) { redirect: '/checkout' }  -> redirige a una ruta específica
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
    <main className="min-h-dvh grid place-items-center px-3 py-6 bg-slate-900">
      <section className="w-full max-w-sm sm:max-w-md">
        <header className="text-center mb-4">
          <h1
            className="text-2xl font-bold text-slate-100"
            aria-live="polite"
          >
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
        </header>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 shadow-xl">
          {/* Tabs (segmented) accesibles */}
          <div
            role="tablist"
            aria-label="Seleccionar modo de autenticación"
            onKeyDown={onTabKeyDown}
            className="grid grid-cols-2 gap-1 bg-slate-900/60 p-1 rounded-lg mb-3"
          >
            <button
              role="tab"
              aria-selected={!isRegister}
              aria-controls="panel-login"
              onClick={() => setMode('login')}
              className={`py-2 rounded-md text-sm transition-all ${
                !isRegister
                  ? 'bg-yellow-400 text-slate-900 font-semibold'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={isRegister}
              aria-controls="panel-register"
              onClick={() => setMode('register')}
              className={`py-2 rounded-md text-sm transition-all ${
                isRegister
                  ? 'bg-yellow-400 text-slate-900 font-semibold'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              Registro
            </button>
          </div>

          {/* Contenido con transición suave */}
          <div className="relative">
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

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-yellow-400 hover:text-yellow-300 text-sm"
          >
            ← Volver al inicio
          </button>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
