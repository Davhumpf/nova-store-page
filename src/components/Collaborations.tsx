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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] p-4">
        <div className="flex flex-col items-center p-6 sm:p-8 bg-[#2C2C2C] rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-sm">
          <div className="relative mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#FFD600]/20 border-t-[#FFD600] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-b-[#FFC400] rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-[#FFD600] font-bold text-lg sm:text-xl text-center">Verificando permisos</p>
          <p className="text-gray-400 text-sm text-center mt-2">Cargando panel de colaborador...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!user || !userRole || !['super_admin', 'admin', 'collaborator'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] p-4">
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700/50">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 sm:mb-6">
              <Lock size={24} className="text-white sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Acceso Restringido</h2>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">No tienes permisos para acceder al panel de colaborador.</p>
            <div className="flex items-center gap-2 text-[#FFD600] font-medium text-sm">
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 mb-6">
          <div className="bg-gradient-to-r from-[#FFD600] via-[#FFC400] to-[#FFD600] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/20 rounded-lg backdrop-blur-sm">
                  {getRoleIcon()}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-black">Panel de {getRoleTitle()}</h1>
                  <p className="text-black/70 font-medium text-xs sm:text-sm">Centro de gestión colaborativa</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-black px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm self-start sm:self-auto"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Inicio</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div className="text-center p-3 bg-gradient-to-br from-[#1a1a1a] to-[#2C2C2C] rounded-lg border border-gray-700/30">
                <div className="flex justify-center mb-2">
                  <Users className="text-[#FFD600]" size={16} />
                </div>
                <p className="text-white text-lg sm:text-xl font-bold">{totalUsers}</p>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Usuarios</p>
              </div>

              <div className="text-center p-3 bg-gradient-to-br from-[#1a1a1a] to-[#2C2C2C] rounded-lg border border-gray-700/30">
                <div className="flex justify-center mb-2">
                  <Trophy className="text-[#FFD600]" size={16} />
                </div>
                <p className="text-white text-lg sm:text-xl font-bold">{totalPoints.toLocaleString()}</p>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Puntos Total</p>
              </div>

              <div className="text-center p-3 bg-gradient-to-br from-[#1a1a1a] to-[#2C2C2C] rounded-lg border border-gray-700/30">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="text-[#FFD600]" size={16} />
                </div>
                <p className="text-white text-lg sm:text-xl font-bold">{averagePoints}</p>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 mb-6">
          {/* Filtrador de Productos */}
          <div
            onClick={() => navigate('/colab/collaborator-product-catalog')}
            className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl border border-gray-700/50 p-4 sm:p-6 cursor-pointer hover:border-[#FFD600]/50 hover:shadow-2xl hover:shadow-[#FFD600]/10 transition-all duration-300 group active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Filter className="text-white" size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#FFD600] transition-colors leading-tight">
                    Filtrador de Productos
                  </h3>
                  <ArrowRight className="text-gray-400 group-hover:text-[#FFD600] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" size={18} />
                </div>

                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  Herramienta avanzada para filtrar y buscar productos con funciones especiales
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Search size={12} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-400 text-xs font-medium">Búsqueda avanzada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-400 text-xs font-medium">Función especial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Catálogo Express */}
          <div
            onClick={() => navigate('/collaborations/express')}
            className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl border border-gray-700/50 p-4 sm:p-6 cursor-pointer hover:border-[#FFD600]/50 hover:shadow-2xl hover:shadow-[#FFD600]/10 transition-all duration-300 group active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <ImageIcon className="text-black" size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#FFD600] transition-colors leading-tight">
                    Catálogo Express
                  </h3>
                  <ArrowRight className="text-gray-400 group-hover:text-[#FFD600] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" size={18} />
                </div>

                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  Genera historias y un PDF listos para compartir, con tu WhatsApp y QR incluidos.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={12} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-400 text-xs font-medium">Historias 1080×1920</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download size={12} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-400 text-xs font-medium">PDF por producto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de usuario */}
        <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-xl p-4 border border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-[#FFD600] font-medium text-sm">
              {getRoleIcon()}
              <span className="truncate">
                Sesión como {getRoleTitle()} • {user?.email}
              </span>
            </div>

            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] hover:from-[#FFC400] hover:to-[#FFB800] text-black px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm w-full sm:w-auto"
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
