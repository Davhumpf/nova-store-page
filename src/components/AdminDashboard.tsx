import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { UserProfile } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Package, 
  Award, 
  TrendingUp, 
  Lock, 
  Loader,
  ArrowRight,
  BarChart3,
  UserPlus,
  Activity
} from 'lucide-react';

interface ExtendedUserProfile extends UserProfile {
  id: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  planType: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  duration: string;
  devices: string;
  inStock: boolean;
}

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [adminEmails] = useState([
    'scpu.v1@gmail.com',
    //para añadir el correo de algun ayudante futuro
  ]);

  useEffect(() => {
    // Verificar si el usuario actual es administrador
    if (!user || !adminEmails.includes(user.email || '')) {
      navigate('/');
      return;
    }

    // Cargar datos para estadísticas
    const fetchData = async () => {
      try {
        await Promise.all([fetchUsers(), fetchProducts()]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, adminEmails, navigate]);

  // Cargar usuarios para estadísticas
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('email'));
      const querySnapshot = await getDocs(q);
      
      const usersData: ExtendedUserProfile[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...(doc.data() as UserProfile)
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  // Cargar productos para estadísticas
  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  // Renderizar pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="flex flex-col items-center p-8 bg-[#2C2C2C] rounded-xl shadow-2xl border border-gray-700/50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FFD600]/20 border-t-[#FFD600] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#FFC400] rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="mt-4 text-[#FFD600] font-bold text-lg">Cargando panel de administración</p>
          <p className="text-gray-400 text-sm mt-1">Preparando el entorno...</p>
        </div>
      </div>
    );
  }

  // Verificar si es admin
  if (!user || !adminEmails.includes(user.email || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-700/50">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6">
              <Lock size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Acceso Restringido</h2>
            <p className="text-gray-300 mb-6">No tienes permisos para acceder al panel de administración.</p>
            <div className="flex items-center gap-2 text-[#FFD600] font-medium">
              <Shield size={16} />
              <span>Área protegida</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
  const inStockProducts = products.filter(p => p.inStock).length;
  const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header Compacto */}
        <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 mb-6">
          <div className="bg-gradient-to-r from-[#FFD600] via-[#FFC400] to-[#FFD600] p-4">
            <div className="flex items-center justify-between">
              {/* Título y subtítulo */}
              <div className="flex items-center gap-4">
                <div className="p-2 bg-black/20 rounded-lg backdrop-blur-sm">
                  <Shield className="text-black" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">Panel de Administración</h1>
                  <p className="text-black/70 font-medium text-sm">Centro de control del sistema</p>
                </div>
              </div>
              
              {/* Estadísticas en línea */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-black text-xs font-medium">Total Usuarios</p>
                  <p className="text-black text-lg font-bold">{totalUsers}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-black text-xs font-medium">Productos</p>
                  <p className="text-black text-lg font-bold">{inStockProducts}/{totalProducts}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-black text-xs font-medium">Total Puntos</p>
                  <p className="text-black text-lg font-bold">{totalPoints.toLocaleString()}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-black text-xs font-medium">Promedio Puntos</p>
                  <p className="text-black text-lg font-bold">{averagePoints}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones de navegación principales */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Gestión de Usuarios */}
          <div
            onClick={() => navigate('/admin/users')}
            className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-xl border border-gray-700/50 p-6 cursor-pointer hover:border-[#FFD600]/50 hover:shadow-2xl hover:shadow-[#FFD600]/10 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FFD600] transition-colors">
                    Gestión de Usuarios
                  </h3>
                  <ArrowRight className="text-gray-400 group-hover:text-[#FFD600] group-hover:translate-x-1 transition-all" size={20} />
                </div>
                
                <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                  Administra usuarios registrados, sus puntos y roles en el sistema
                </p>
                
                <div className="flex items-center gap-2 text-xs">
                  <Activity size={14} className="text-blue-400" />
                  <span className="text-gray-400 font-medium">{totalUsers} usuarios registrados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gestión de Productos */}
          <div
            onClick={() => navigate('/admin/products')}
            className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-xl border border-gray-700/50 p-6 cursor-pointer hover:border-[#FFD600]/50 hover:shadow-2xl hover:shadow-[#FFD600]/10 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="text-white" size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FFD600] transition-colors">
                    Gestión de Productos
                  </h3>
                  <ArrowRight className="text-gray-400 group-hover:text-[#FFD600] group-hover:translate-x-1 transition-all" size={20} />
                </div>
                
                <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                  Crear, editar y administrar productos del catálogo de servicios
                </p>
                
                <div className="flex items-center gap-2 text-xs">
                  <Activity size={14} className="text-green-400" />
                  <span className="text-gray-400 font-medium">{inStockProducts}/{totalProducts} productos disponibles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones adicionales */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Reportes y Análisis */}
          <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-xl border border-gray-700/50 p-6 opacity-60">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="text-white" size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">
                    Reportes y Análisis
                  </h3>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Próximamente</span>
                </div>
                
                <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                  Visualiza estadísticas detalladas y métricas del sistema
                </p>
                
                <div className="flex items-center gap-2 text-xs">
                  <Activity size={14} className="text-purple-400" />
                  <span className="text-gray-400 font-medium">En desarrollo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gestión de Colaboradores */}
          <div
            onClick={() => navigate('/admin/colaborators')}
            className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-xl border border-gray-700/50 p-6 cursor-pointer hover:border-[#FFD600]/50 hover:shadow-2xl hover:shadow-[#FFD600]/10 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="text-white" size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FFD600] transition-colors">
                    Gestión de Colaboradores
                  </h3>
                  <ArrowRight className="text-gray-400 group-hover:text-[#FFD600] group-hover:translate-x-1 transition-all" size={20} />
                </div>
                
                <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                  Administra el equipo de colaboradores y sus permisos
                </p>
                
                <div className="flex items-center gap-2 text-xs">
                  <Activity size={14} className="text-orange-400" />
                  <span className="text-gray-400 font-medium">Gestión de equipo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#FFD600] font-medium text-sm">
              <Shield size={16} />
              <span>Sesión administrativa activa - {user?.email}</span>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] hover:from-[#FFC400] hover:to-[#FFB800] text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;