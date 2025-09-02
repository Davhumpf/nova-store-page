import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const defaultMode = location.state?.defaultMode === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // 🚫 bloquear scroll mientras se está en AuthPage
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const handleAuthSuccess = () => {
    if (location.state?.returnToCheckout) {
      navigate('/', { replace: true });
      return;
    }
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <main className="h-screen flex items-center justify-center px-4 bg-slate-900">
      <section className="w-full max-w-sm md:-translate-y-6 lg:-translate-y-10 xl:-translate-y-14">
        <header className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-100">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
        </header>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-1 bg-slate-900/60 p-1 rounded-lg mb-3">
            <button
              onClick={() => setMode('login')}
              className={`py-2 rounded-md text-sm ${
                mode === 'login'
                  ? 'bg-yellow-400 text-slate-900 font-semibold'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
              aria-pressed={mode === 'login'}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`py-2 rounded-md text-sm ${
                mode === 'register'
                  ? 'bg-yellow-400 text-slate-900 font-semibold'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
              aria-pressed={mode === 'register'}
            >
              Registro
            </button>
          </div>

          {mode === 'login' ? (
            <Login onSuccess={handleAuthSuccess} />
          ) : (
            <Register onSuccess={handleAuthSuccess} />
          )}
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
