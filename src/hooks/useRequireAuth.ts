// src/hooks/useRequireAuth.ts

import { useUser } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const useRequireAuth = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = (callback?: () => void) => {
    if (!user) {
      // Guarda la ubicación actual para redirigir después del login
      navigate('/auth', { state: { from: location } });
      return false;
    }
    
    // Si hay usuario, ejecuta el callback si existe
    if (callback) {
      callback();
    }
    return true;
  };

  return { requireAuth, isAuthenticated: !!user };
};