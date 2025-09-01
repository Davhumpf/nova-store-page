// AuthPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determinar el modo inicial basado en el estado o por defecto login
  const defaultMode = location.state?.defaultMode || 'login';
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');

  // Función para manejar navegación exitosa
  const handleAuthSuccess = () => {
    // Si viene del carrito, redirigir al home y abrir el carrito
    if (location.state?.returnToCheckout) {
      navigate('/', { replace: true });
      return;
    }
    
    // Redirigir a la página anterior o al home
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#18001B] flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#FAE5D8]">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
        </div>
        
        <div className="bg-[#2A0A2E] p-6 rounded-lg shadow-lg">
          {/* Botones de toggle compactos */}
          <div className="flex mb-4 bg-[#18001B] rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-[#FFD600] text-[#18001B]'
                  : 'text-[#B0B0B0] hover:text-[#FAE5D8]'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Iniciar Sesión
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-[#FFD600] text-[#18001B]'
                  : 'text-[#B0B0B0] hover:text-[#FAE5D8]'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Registrarse
            </button>
          </div>

          {/* Componente condicional */}
          {isLogin ? (
            <Login onSuccess={handleAuthSuccess} />
          ) : (
            <Register onSuccess={handleAuthSuccess} />
          )}
        </div>

        {/* Link para ir al home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#FFD600] hover:text-[#E6C200] text-sm"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;