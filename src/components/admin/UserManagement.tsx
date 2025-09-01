import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { UserProfile, addPointsToUser } from '../../services/UserService';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Award, 
  PlusCircle, 
  MinusCircle, 
  Loader, 
  Lock, 
  Users, 
  Save, 
  Star, 
  Eye, 
  ArrowLeft,
  Shield,
  UserCheck
} from 'lucide-react';

interface ExtendedUserProfile extends UserProfile {
  id: string;
  name?: string; // Añadir propiedad name como opcional
}

const UserManagement: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ExtendedUserProfile | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!user?.email) {
          navigate('/');
          return;
        }

        // Verificar si es el admin principal (super_admin)
        if (user.email === 'scpu.v1@gmail.com') {
          setUserRole('super_admin');
          await fetchUsers();
          return;
        }

        // Consultar rol desde Firestore (igual que en Header.tsx y Collaborations.tsx)
        const rolesRef = collection(db, 'roles');
        const q = query(rolesRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const roleDoc = querySnapshot.docs[0];
          const roleData = roleDoc.data();
          
          // Verificar si el rol está activo y es admin o colaborador
          if (roleData.isActive && ['admin', 'collaborator'].includes(roleData.role)) {
            setUserRole(roleData.role);
            await fetchUsers();
            return;
          }
        }

        // Si no tiene permisos, redirigir al inicio
        navigate('/');
      } catch (error) {
        console.error('Error al verificar acceso:', error);
        navigate('/');
      }
    };

    checkAccess();
  }, [user, navigate]);

  // Cargar usuarios
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
      setFilteredUsers(usersData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setIsLoading(false);
    }
  };

  // Filtrar usuarios por búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Añadir puntos a usuario
  const handleAddPoints = async () => {
    if (!selectedUser || pointsToAdd === 0) return;
    
    setIsUpdating(true);
    try {
      await addPointsToUser(selectedUser.id, pointsToAdd);
      
      // Actualizar la lista local
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, points: u.points + pointsToAdd }
          : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Actualizar usuario seleccionado
      setSelectedUser(prev => prev ? { ...prev, points: prev.points + pointsToAdd } : null);
      setPointsToAdd(0);
      
    } catch (error) {
      console.error('Error al añadir puntos:', error);
    } finally {
      setIsUpdating(false);
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
          <p className="mt-4 text-[#FFD600] font-bold text-lg">Verificando permisos</p>
          <p className="text-gray-400 text-sm mt-1">Cargando gestión de usuarios...</p>
        </div>
      </div>
    );
  }

  // Verificar si tiene acceso (esta validación adicional por si acaso)
  if (!user || !userRole || !['super_admin', 'admin', 'collaborator'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-700/50">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6">
              <Lock size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Acceso Restringido</h2>
            <p className="text-gray-300 mb-6">No tienes permisos para acceder a la gestión de usuarios.</p>
            <div className="flex items-center gap-2 text-[#FFD600] font-medium">
              <Shield size={16} />
              <span>Área protegida</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRoleTitle = () => {
    switch (userRole) {
      case 'super_admin':
        return 'Gestión de Usuarios - Super Admin';
      case 'admin':
        return 'Gestión de Usuarios - Admin';
      case 'collaborator':
        return 'Gestión de Usuarios - Colaborador';
      default:
        return 'Gestión de Usuarios';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'super_admin':
        return <Shield className="text-[#FFD600]" size={24} />;
      case 'admin':
        return <Shield className="text-[#FFD600]" size={24} />;
      case 'collaborator':
        return <UserCheck className="text-[#FFD600]" size={24} />;
      default:
        return <Users className="text-[#FFD600]" size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 bg-[#FFD600]/10 hover:bg-[#FFD600]/20 rounded-lg transition-all duration-300"
                >
                  <ArrowLeft className="text-[#FFD600]" size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                  {getRoleIcon()}
                  <div>
                    <h1 className="text-2xl font-bold text-white">{getRoleTitle()}</h1>
                    <p className="text-gray-400 text-sm">Administrar usuarios registrados y gestionar puntos</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-xs font-medium">Total Usuarios</p>
                  <p className="text-[#FFD600] text-lg font-bold">{users.length}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-xs font-medium">Mostrando</p>
                  <p className="text-[#FFD600] text-lg font-bold">{filteredUsers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de usuarios */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-700/50 p-6">
              {/* Barra de búsqueda */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar usuarios por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-gray-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50 focus:border-[#FFD600]/50 transition-all duration-300"
                />
              </div>

              {/* Lista de usuarios */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUsers.map((userItem) => (
                  <div
                    key={userItem.id}
                    onClick={() => setSelectedUser(userItem)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      selectedUser?.id === userItem.id
                        ? 'bg-[#FFD600]/10 border-[#FFD600]/50'
                        : 'bg-[#1a1a1a]/50 border-gray-700/30 hover:border-[#FFD600]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#FFD600] to-[#FFC400] rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-black font-bold text-sm">
                            {userItem.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-white font-semibold text-sm">{userItem.email}</p>
                          {userItem.name && (
                            <p className="text-gray-400 text-xs">{userItem.name}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-[#FFD600]/15 px-3 py-1 rounded-full">
                          <Award size={14} className="text-[#FFD600]" />
                          <span className="text-[#FFD600] font-bold text-sm">{userItem.points}</span>
                        </div>
                        
                        {selectedUser?.id === userItem.id && (
                          <div className="w-2 h-2 bg-[#FFD600] rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No se encontraron usuarios</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel de gestión de puntos */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-700/50 p-6 sticky top-4">
              {selectedUser ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#FFD600] to-[#FFC400] rounded-full flex items-center justify-center shadow-lg mx-auto mb-3">
                      <span className="text-black font-bold text-xl">
                        {selectedUser.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg">{selectedUser.email}</h3>
                    {selectedUser.name && (
                      <p className="text-gray-400 text-sm">{selectedUser.name}</p>
                    )}
                  </div>

                  <div className="bg-[#1a1a1a]/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="text-[#FFD600]" size={20} />
                      <span className="text-gray-400 text-sm">Puntos actuales</span>
                    </div>
                    <p className="text-[#FFD600] font-bold text-3xl text-center">{selectedUser.points}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Puntos a añadir/quitar
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPointsToAdd(prev => prev - 10)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                        >
                          <MinusCircle size={20} className="text-red-400" />
                        </button>
                        
                        <input
                          type="number"
                          value={pointsToAdd}
                          onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                          className="flex-1 bg-[#1a1a1a] border border-gray-700/50 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50"
                        />
                        
                        <button
                          onClick={() => setPointsToAdd(prev => prev + 10)}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                        >
                          <PlusCircle size={20} className="text-green-400" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[10, 50, 100].map(value => (
                        <button
                          key={value}
                          onClick={() => setPointsToAdd(value)}
                          className="py-2 px-3 bg-[#FFD600]/10 hover:bg-[#FFD600]/20 border border-[#FFD600]/30 rounded-lg text-[#FFD600] text-sm font-medium transition-all duration-300"
                        >
                          +{value}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[-10, -50, -100].map(value => (
                        <button
                          key={value}
                          onClick={() => setPointsToAdd(value)}
                          className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-all duration-300"
                        >
                          {value}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleAddPoints}
                      disabled={pointsToAdd === 0 || isUpdating}
                      className="w-full bg-gradient-to-r from-[#FFD600] to-[#FFC400] hover:from-[#FFC400] hover:to-[#FFB800] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <Loader size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      {isUpdating ? 'Actualizando...' : 'Aplicar cambios'}
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-[#1a1a1a]/30 rounded-xl">
                    <p className="text-xs text-gray-400 text-center">
                      Nuevos puntos: {selectedUser.points + pointsToAdd}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Eye size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium mb-2">Selecciona un usuario</p>
                  <p className="text-gray-500 text-sm">Haz clic en un usuario de la lista para gestionar sus puntos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#FFD600] font-medium text-sm">
              {getRoleIcon()}
              <span>Sesión activa como {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'} - {user?.email}</span>
            </div>
            
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] hover:from-[#FFC400] hover:to-[#FFB800] text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;