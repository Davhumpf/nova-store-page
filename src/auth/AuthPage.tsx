// src/auth/AuthPage.tsx
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ⚡ Carga diferida para reducir el bundle inicial
const Login = React.lazy(() => import('./Login'));
const Register = React.lazy(() => import('./Register'));

const FallbackCard = () => (
  <div className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 rounded-full border-2 border-[#4CAF50]/30 border-t-[#4CAF50] animate-spin" />
      <span className="text-[#8A8A8A] text-xs font-light">Cargando…</span>
    </div>
    <div className="space-y-2">
      <div className="h-8 rounded-md bg-[#E8E8E8] animate-pulse" />
      <div className="h-8 rounded-md bg-[#E8E8E8] animate-pulse" />
      <div className="h-9 rounded-md bg-[#E8E8E8] animate-pulse" />
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
    <main className="min-h-dvh grid place-items-center px-3 py-6 bg-[#E8E8E8]">
      <section className="w-full max-w-sm sm:max-w-md">
        <header className="text-center mb-4">
          <h1
            className="text-xl font-light text-[#2A2A2A]"
            aria-live="polite"
          >
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="text-[10px] text-[#8A8A8A] font-light mt-1">
            {isRegister ? 'Regístrate para comenzar' : 'Accede a tu cuenta'}
          </p>
        </header>

        <div className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          {/* Tabs (segmented) accesibles */}
          <div
            role="tablist"
            aria-label="Seleccionar modo de autenticación"
            onKeyDown={onTabKeyDown}
            className="grid grid-cols-2 gap-1 bg-[#E8E8E8] p-1 rounded-md mb-3"
          >
            <button
              role="tab"
              aria-selected={!isRegister}
              aria-controls="panel-login"
              onClick={() => setMode('login')}
              className={`py-2 rounded-md text-xs font-medium transition-all ${
                !isRegister
                  ? 'bg-[#4CAF50] text-white shadow-[0_2px_8px_rgba(76,175,80,0.25)]'
                  : 'text-[#8A8A8A] hover:text-[#2A2A2A]'
              }`}
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={isRegister}
              aria-controls="panel-register"
              onClick={() => setMode('register')}
              className={`py-2 rounded-md text-xs font-medium transition-all ${
                isRegister
                  ? 'bg-[#4CAF50] text-white shadow-[0_2px_8px_rgba(76,175,80,0.25)]'
                  : 'text-[#8A8A8A] hover:text-[#2A2A2A]'
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
            className="text-[#4CAF50] hover:text-[#45a049] text-xs font-medium transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;