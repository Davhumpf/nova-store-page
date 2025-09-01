import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Power,
  PowerOff,
  History,
  ArrowLeft,
  Loader,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Mail,
  Clock
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  points: number;
}

interface Role {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: any;
  createdBy: string;
  lastActivity?: any;
}

interface ActionHistory {
  id: string;
  collaboratorEmail: string;
  action: string;
  targetUser: string;
  pointsChanged: number;
  timestamp: any;
  description: string;
}

const Colaborators: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Estados para formularios y filtros
  const [searchEmail, setSearchEmail] = useState('');
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Estados para feedback
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const [adminEmails] = useState([
    'scpu.v1@gmail.com',
    // para añadir más admins en el futuro
  ]);

  useEffect(() => {
    // Verificar si el usuario actual es administrador
    if (!user || !adminEmails.includes(user.email || '')) {
      navigate('/admin');
      return;
    }

    fetchData();
  }, [user, adminEmails, navigate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchRoles(), fetchUsers(), fetchActionHistory()]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showMessage('error', 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesRef = collection(db, 'roles');
      const q = query(rolesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const rolesData: Role[] = [];
      querySnapshot.forEach((doc) => {
        rolesData.push({
          id: doc.id,
          ...doc.data()
        } as Role);
      });
      
      setRoles(rolesData);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const usersData: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        } as UserProfile);
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const fetchActionHistory = async () => {
    try {
      const historyRef = collection(db, 'actionHistory');
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const historyData: ActionHistory[] = [];
      querySnapshot.forEach((doc) => {
        historyData.push({
          id: doc.id,
          ...doc.data()
        } as ActionHistory);
      });
      
      setActionHistory(historyData);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const addCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) {
      showMessage('error', 'Por favor ingresa un correo válido');
      return;
    }

    // Verificar si el email ya existe en roles
    const existingRole = roles.find(role => role.email === newCollaboratorEmail.trim());
    if (existingRole) {
      showMessage('error', 'Este correo ya está registrado como colaborador');
      return;
    }

    // Verificar si el usuario existe en la base de datos
    const userExists = users.find(u => u.email === newCollaboratorEmail.trim());
    if (!userExists) {
      showMessage('error', 'Este correo no está registrado en el sistema');
      return;
    }

    try {
      setIsAdding(true);
      
      const newRole = {
        email: newCollaboratorEmail.trim(),
        role: 'collaborator',
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: user?.email || '',
        lastActivity: serverTimestamp()
      };

      await addDoc(collection(db, 'roles'), newRole);
      
      showMessage('success', 'Colaborador agregado exitosamente');
      setNewCollaboratorEmail('');
      setShowAddForm(false);
      
      await fetchRoles();
    } catch (error) {
      console.error('Error al agregar colaborador:', error);
      showMessage('error', 'Error al agregar el colaborador');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleCollaboratorStatus = async (roleId: string, currentStatus: boolean) => {
    try {
      const roleRef = doc(db, 'roles', roleId);
      await updateDoc(roleRef, {
        isActive: !currentStatus,
        lastActivity: serverTimestamp()
      });
      
      showMessage('success', `Colaborador ${!currentStatus ? 'activado' : 'inactivado'} exitosamente`);
      await fetchRoles();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showMessage('error', 'Error al cambiar el estado del colaborador');
    }
  };

  const deleteCollaborator = async (roleId: string, email: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar al colaborador ${email}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'roles', roleId));
      showMessage('success', 'Colaborador eliminado exitosamente');
      await fetchRoles();
    } catch (error) {
      console.error('Error al eliminar colaborador:', error);
      showMessage('error', 'Error al eliminar el colaborador');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const getCollaboratorHistory = (collaboratorEmail: string) => {
    return actionHistory.filter(action => action.collaboratorEmail === collaboratorEmail);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="flex flex-col items-center p-8 bg-[#2C2C2C] rounded-xl shadow-2xl border border-gray-700/50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FFD600]/20 border-t-[#FFD600] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-[#FFD600] font-bold text-lg">Cargando colaboradores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] py-4 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 mb-6">
          <div className="bg-gradient-to-r from-[#FFD600] via-[#FFC400] to-[#FFD600] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 bg-black/20 rounded-lg backdrop-blur-sm hover:bg-black/30 transition-colors"
                >
                  <ArrowLeft className="text-black" size={20} />
                </button>
                <div className="p-2 bg-black/20 rounded-lg backdrop-blur-sm">
                  <Users className="text-black" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">Gestión de Colaboradores</h1>
                  <p className="text-black/70 font-medium text-sm">Administra roles y permisos</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-black text-xs font-medium">Total Colaboradores</p>
                  <p className="text-black text-lg font-bold">{roles.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-black text-xs font-medium">Activos</p>
                  <p className="text-black text-lg font-bold">{roles.filter(r => r.isActive).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de feedback */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            message.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> :
             message.type === 'error' ? <XCircle size={20} /> :
             <Activity size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Controles */}
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-xl border border-gray-700/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Buscador */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar colaborador
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Buscar por correo electrónico..."
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:border-[#FFD600] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Botón agregar */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] hover:from-[#FFC400] hover:to-[#FFB800] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Agregar Colaborador
            </button>
          </div>

          {/* Formulario de agregar */}
          {showAddForm && (
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-gray-600/30">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Mail size={18} />
                Nuevo Colaborador
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="flex-1 px-4 py-3 bg-[#2C2C2C] border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:border-[#FFD600] focus:outline-none transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCollaborator}
                    disabled={isAdding}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    {isAdding ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                    {isAdding ? 'Agregando...' : 'Agregar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCollaboratorEmail('');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de colaboradores */}
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield size={20} />
              Colaboradores Registrados ({filteredRoles.length})
            </h2>
          </div>

          {filteredRoles.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400 text-lg">
                {searchEmail ? 'No se encontraron colaboradores' : 'No hay colaboradores registrados'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {filteredRoles.map((role) => {
                const userInfo = users.find(u => u.email === role.email);
                const collaboratorHistory = getCollaboratorHistory(role.email);
                
                return (
                  <div key={role.id} className="p-6 hover:bg-[#1a1a1a]/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Info del colaborador */}
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${role.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          <Mail className={`${role.isActive ? 'text-green-400' : 'text-red-400'}`} size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{role.email}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Rol: {role.role}</span>
                            <span className={`flex items-center gap-1 ${role.isActive ? 'text-green-400' : 'text-red-400'}`}>
                              {role.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              {role.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          {userInfo && (
                            <p className="text-xs text-gray-500 mt-1">
                              Usuario registrado - {userInfo.points} puntos
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        {/* Historial */}
                        <button
                          onClick={() => {
                            setSelectedCollaborator(role.email);
                            setShowHistory(true);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1 text-sm"
                          title="Ver historial"
                        >
                          <History size={16} />
                          <span className="hidden sm:inline">Historial ({collaboratorHistory.length})</span>
                        </button>

                        {/* Toggle estado */}
                        <button
                          onClick={() => toggleCollaboratorStatus(role.id, role.isActive)}
                          className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm ${
                            role.isActive 
                              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          title={role.isActive ? 'Inactivar' : 'Activar'}
                        >
                          {role.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                          <span className="hidden sm:inline">{role.isActive ? 'Inactivar' : 'Activar'}</span>
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => deleteCollaborator(role.id, role.email)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1 text-sm"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de historial */}
        {showHistory && selectedCollaborator && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-xl border border-gray-700/50 max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <History size={20} />
                  Historial de {selectedCollaborator}
                </h3>
                <button
                  onClick={() => {
                    setShowHistory(false);
                    setSelectedCollaborator(null);
                  }}
                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                {getCollaboratorHistory(selectedCollaborator).length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="mx-auto text-gray-500 mb-4" size={48} />
                    <p className="text-gray-400">No hay actividades registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCollaboratorHistory(selectedCollaborator).map((action) => (
                      <div key={action.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700/30">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            action.pointsChanged > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <Activity className={`${
                              action.pointsChanged > 0 ? 'text-green-400' : 'text-red-400'
                            }`} size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">{action.action}</span>
                              <span className={`text-sm px-2 py-1 rounded ${
                                action.pointsChanged > 0 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {action.pointsChanged > 0 ? '+' : ''}{action.pointsChanged} puntos
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{action.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Usuario: {action.targetUser}</span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {action.timestamp?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colaborators;