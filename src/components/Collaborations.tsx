// src/components/Collaborations.tsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { UserProfile } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Filter,
  UserCheck,
  Activity,
  Search,
  ArrowRight,
  Lock,
  Users,
  Trophy,
  TrendingUp,
  Home,
  Image as ImageIcon, // icono para Catálogo Express
  Download
} from 'lucide-react';

interface ExtendedUserProfile extends UserProfile {
  id: string;
}

const Collaborations: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!user?.email) {
          navigate('/');
          return;
        }

        // normaliza email
        const emailLower = user.email.toLowerCase();

        // Super admin
        if (emailLower === 'scpu.v1@gmail.com') {
          setUserRole('super_admin');
          await fetchUsers();
          setIsLoading(false);
          return;
        }

        // Consultar rol desde Firestore (email en minúsculas)
        const rolesRef = collection(db, 'roles');
        const qRole = query(rolesRef, where('email', '==', emailLower));
        const snap = await getDocs(qRole);

        if (!snap.empty) {
          const roleData: any = snap.docs[0].data();
          const isActive = roleData?.isActive !== false;
          const role = isActive ? roleData?.role : null;

          if (role && ['collaborator', 'admin'].includes(role)) {
            setUserRole(role);
            await fetchUsers();
            setIsLoading(false);
            return;
          }
        }

        navigate('/');
      } catch (error) {
        console.error('Error al verificar acceso:', error);
        navigate('/');
      }
    };

    checkAccess();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const qUsers = query(usersRef, orderBy('email'));
      const querySnapshot = await getDocs(qUsers);

      const usersData: ExtendedUserProfile[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...(doc.data() as UserProfile),
        });
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center halftone-pattern bg-white dark:bg-black p-4">
        <div className="flex flex-col items-center p-6 sm:p-8 comic-panel bg-white dark:bg-black w-full max-w-sm animate-comic-pop">
          <div className="relative mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-pop-purple/20 dark:border-pop-pink/20 border-t-pop-purple dark:border-t-pop-pink rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-b-pop-orange rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-pop-purple dark:text-pop-pink font-black text-lg sm:text-xl text-center uppercase tracking-wide">Verificando permisos</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center mt-2 font-bold">Cargando panel de colaborador...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!user || !userRole || !['super_admin', 'admin', 'collaborator'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center halftone-pattern bg-white dark:bg-black p-4">
        <div className="comic-panel bg-white dark:bg-black p-6 sm:p-8 max-w-md w-full animate-comic-pop stipple-pattern">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 sm:p-4 bg-white dark:bg-black border-black dark:border-white comic-border mb-4 sm:mb-6">
              <Lock size={24} className="text-pop-pink dark:text-pop-pink sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3 uppercase tracking-wide">Acceso Restringido</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base font-semibold">No tienes permisos para acceder al panel de colaborador.</p>
            <div className="flex items-center gap-2 text-pop-purple dark:text-pop-pink font-black text-sm uppercase tracking-wide">
              <Shield size={16} />
              <span>Área protegida</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stats
  const totalUsers = users.length;
  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
  const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

  const getRoleTitle = () => {
    switch (userRole) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      case 'collaborator':
        return 'Colaborador';
      default:
        return 'Colaborador';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'super_admin':
        return <Shield className="text-black" size={20} />;
      case 'admin':
      case 'collaborator':
      default:
        return <UserCheck className="text-black" size={20} />;
    }
  };

  return (
    <div className="min-h-screen halftone-pattern bg-white dark:bg-black p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="comic-panel bg-white dark:bg-black shadow-[0_4px_12px_rgba(0,0,0,0.8)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.3)] overflow-hidden mb-6 animate-comic-pop">
          <div className="bg-white dark:bg-black border-black dark:border-white p-4 sm:p-6 relative">
            <div className="bendaydots-pattern absolute inset-0 opacity-20"></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 comic-border bg-white dark:bg-black backdrop-blur-sm">
                  {getRoleIcon()}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-wide">Panel de {getRoleTitle()}</h1>
                  <p className="text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm">Centro de gestión colaborativa</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="comic-button bg-white dark:bg-black border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white px-3 py-2 font-black text-sm self-start sm:self-auto speed-lines"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Inicio</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 sm:p-6 crosshatch-pattern">
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div className="text-center p-3 comic-border stipple-pattern bg-white dark:bg-black comic-hover">
                <div className="flex justify-center mb-2">
                  <Users className="text-pop-purple dark:text-pop-pink" size={16} />
                </div>
                <p className="text-gray-900 dark:text-white text-lg sm:text-xl font-black">{totalUsers}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase">Usuarios</p>
              </div>

              <div className="text-center p-3 comic-border stipple-pattern bg-white dark:bg-black comic-hover">
                <div className="flex justify-center mb-2">
                  <Trophy className="text-pop-orange dark:text-pop-orange" size={16} />
                </div>
                <p className="text-gray-900 dark:text-white text-lg sm:text-xl font-black">{totalPoints.toLocaleString()}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase">Puntos Total</p>
              </div>

              <div className="text-center p-3 comic-border stipple-pattern bg-white dark:bg-black comic-hover">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="text-pop-pink dark:text-pop-purple" size={16} />
                </div>
                <p className="text-gray-900 dark:text-white text-lg sm:text-xl font-black">{averagePoints}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase">Promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 mb-6">
          {/* Filtrador de Productos */}
          <div
            onClick={() => navigate('/colab/collaborator-product-catalog')}
            className="comic-panel stipple-pattern bg-white dark:bg-black p-4 sm:p-6 cursor-pointer comic-hover transition-all duration-300 group active:scale-[0.98] animate-comic-pop speed-lines"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-black border-black dark:border-white comic-border shadow-[0_4px_8px_rgba(0,0,0,0.6)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Filter className="text-pop-purple dark:text-pop-pink" size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-pop-purple dark:group-hover:text-pop-pink transition-colors leading-tight uppercase tracking-wide">
                    Filtrador de Productos
                  </h3>
                  <ArrowRight className="text-gray-600 dark:text-gray-400 group-hover:text-pop-purple dark:group-hover:text-pop-pink group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" size={18} />
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed font-semibold">
                  Herramienta avanzada para filtrar y buscar productos con funciones especiales
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Search size={12} className="text-pop-purple dark:text-pop-pink flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">Búsqueda avanzada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-pop-purple dark:text-pop-pink flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">Función especial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Catálogo Express */}
          <div
            onClick={() => navigate('/collaborations/express')}
            className="comic-panel stipple-pattern bg-white dark:bg-black p-4 sm:p-6 cursor-pointer comic-hover transition-all duration-300 group active:scale-[0.98] animate-comic-pop speed-lines"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-black border-black dark:border-white comic-border shadow-[0_4px_8px_rgba(0,0,0,0.6)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <ImageIcon className="text-pop-orange dark:text-pop-orange" size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-pop-orange dark:group-hover:text-pop-orange transition-colors leading-tight uppercase tracking-wide">
                    Catálogo Express
                  </h3>
                  <ArrowRight className="text-gray-600 dark:text-gray-400 group-hover:text-pop-orange dark:group-hover:text-pop-orange group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" size={18} />
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed font-semibold">
                  Genera historias y un PDF listos para compartir, con tu WhatsApp y QR incluidos.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={12} className="text-pop-orange dark:text-pop-orange flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">Historias 1080×1920</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download size={12} className="text-pop-orange dark:text-pop-orange flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">PDF por producto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de usuario */}
        <div className="comic-panel bg-white dark:bg-black p-4 bendaydots-pattern">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2 text-pop-purple dark:text-pop-pink font-black text-sm uppercase tracking-wide">
              {getRoleIcon()}
              <span className="truncate">
                Sesión como {getRoleTitle()} • {user?.email}
              </span>
            </div>

            <button
              onClick={() => navigate('/')}
              className="comic-button bg-white dark:bg-black border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white px-4 py-2 font-black transition-all duration-300 transform hover:scale-105 shadow-[0_4px_8px_rgba(0,0,0,0.6)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.3)] text-sm w-full sm:w-auto speed-lines"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collaborations;
