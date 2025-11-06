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
  ArrowRight,
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
  
  const [searchEmail, setSearchEmail] = useState('');
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const [adminEmails] = useState(['scpu.v1@gmail.com']);

  useEffect(() => {
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
        rolesData.push({ id: doc.id, ...doc.data() } as Role);
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
        usersData.push({ id: doc.id, ...doc.data() } as UserProfile);
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
        historyData.push({ id: doc.id, ...doc.data() } as ActionHistory);
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

    const existingRole = roles.find(role => role.email === newCollaboratorEmail.trim());
    if (existingRole) {
      showMessage('error', 'Este correo ya está registrado como colaborador');
      return;
    }

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
      <div className="min-h-screen flex items-center justify-center bg-[#E8E8E8] dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-[#4FC3F7]/30 dark:border-[#81D4FA]/30 border-t-[#4FC3F7] dark:border-t-[#81D4FA] rounded-full animate-spin"></div>
          <p className="mt-2 text-[#5A5A5A] dark:text-gray-400 text-xs font-light">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8] dark:bg-gray-900 py-3 px-3 sm:px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Botón volver estilo Apple */}
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 flex items-center gap-1.5 text-xs text-[#4FC3F7] dark:text-[#81D4FA] hover:text-[#039BE5] dark:hover:text-[#4FC3F7] transition-colors group"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Panel Admin</span>
        </button>

        {/* Header minimalista */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-8 bg-[#4FC3F7] dark:bg-[#81D4FA] rounded-full shadow-sm"></div>
            <div className="flex-1">
              <h1 className="text-lg font-light text-[#2A2A2A] dark:text-white">Gestión de Colaboradores</h1>
              <p className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light">Administra roles y permisos del equipo</p>
            </div>
            <div className="flex gap-3 text-center">
              <div>
                <p className="text-[9px] text-[#8A8A8A] dark:text-gray-400">Total</p>
                <p className="text-sm font-bold text-[#4FC3F7] dark:text-[#81D4FA]">{roles.length}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#8A8A8A] dark:text-gray-400">Activos</p>
                <p className="text-sm font-bold text-[#4CAF50] dark:text-[#66FF7A]">{roles.filter(r => r.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de feedback */}
        {message && (
          <div className={`mb-3 p-2.5 rounded-lg flex items-center gap-2 text-xs border ${
            message.type === 'success' ? 'bg-[#4CAF50]/10 dark:bg-[#66FF7A]/20 text-[#4CAF50] dark:text-[#66FF7A] border-[#4CAF50]/20 dark:border-[#66FF7A]/30' :
            message.type === 'error' ? 'bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/20 dark:border-red-500/30' :
            'bg-[#4FC3F7]/10 dark:bg-[#81D4FA]/20 text-[#4FC3F7] dark:text-[#81D4FA] border-[#4FC3F7]/20 dark:border-[#81D4FA]/30'
          }`}>
            {message.type === 'success' ? <CheckCircle size={14} /> :
             message.type === 'error' ? <XCircle size={14} /> :
             <Activity size={14} />}
            <span className="font-light">{message.text}</span>
          </div>
        )}

        {/* Controles de búsqueda y agregar */}
        <div className="bg-[#F5F5F5] dark:bg-gray-800 rounded-lg border border-[#D0D0D0] dark:border-gray-700 p-3 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Buscador */}
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A] dark:text-gray-400" size={14} />
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Buscar por correo..."
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 rounded-md text-xs text-[#2A2A2A] dark:text-white placeholder-[#8A8A8A] dark:placeholder-gray-400 focus:border-[#4FC3F7] dark:focus:border-[#81D4FA] focus:outline-none transition-colors"
              />
            </div>

            {/* Botón agregar */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#4FC3F7] dark:bg-[#81D4FA] hover:bg-[#039BE5] dark:hover:bg-[#4FC3F7] text-white dark:text-gray-900 px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(79,195,247,0.25)] dark:shadow-none"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>

          {/* Formulario de agregar */}
          {showAddForm && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-md border border-[#D0D0D0] dark:border-gray-600">
              <h3 className="text-xs text-[#2A2A2A] dark:text-white font-medium mb-2 flex items-center gap-1.5">
                <Mail size={12} />
                Nuevo Colaborador
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="flex-1 px-3 py-2 bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-600 rounded-md text-xs text-[#2A2A2A] dark:text-white placeholder-[#8A8A8A] dark:placeholder-gray-400 focus:border-[#4FC3F7] dark:focus:border-[#81D4FA] focus:outline-none transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCollaborator}
                    disabled={isAdding}
                    className="bg-[#4CAF50] dark:bg-[#66FF7A] hover:bg-[#45a049] dark:hover:bg-[#4CAF50] disabled:opacity-50 text-white dark:text-gray-900 px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {isAdding ? <Loader className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                    {isAdding ? 'Agregando...' : 'Agregar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCollaboratorEmail('');
                    }}
                    className="bg-[#8A8A8A] dark:bg-gray-600 hover:bg-[#666666] dark:hover:bg-gray-500 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de colaboradores */}
        <div className="bg-[#F5F5F5] dark:bg-gray-800 rounded-lg border border-[#D0D0D0] dark:border-gray-700 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none">
          <div className="p-3 border-b border-[#D0D0D0] dark:border-gray-700">
            <h2 className="text-sm font-medium text-[#2A2A2A] dark:text-white flex items-center gap-1.5">
              <Shield size={14} />
              Colaboradores ({filteredRoles.length})
            </h2>
          </div>

          {filteredRoles.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-[#D0D0D0] dark:text-gray-600 mb-2" size={32} />
              <p className="text-[#8A8A8A] dark:text-gray-400 text-xs font-light">
                {searchEmail ? 'No se encontraron colaboradores' : 'No hay colaboradores registrados'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#D0D0D0]">
              {filteredRoles.map((role) => {
                const userInfo = users.find(u => u.email === role.email);
                const collaboratorHistory = getCollaboratorHistory(role.email);
                
                return (
                  <div key={role.id} className="p-3 hover:bg-white/50 transition-colors">
                    <div className="flex flex-col gap-2">
                      {/* Info */}
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-full shrink-0 ${role.isActive ? 'bg-[#4CAF50]/10' : 'bg-red-500/10'}`}>
                          <Mail className={`${role.isActive ? 'text-[#4CAF50]' : 'text-red-500'}`} size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs text-[#2A2A2A] font-medium break-all">{role.email}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8A8A8A] mt-0.5">
                            <span>{role.role}</span>
                            <span className={`flex items-center gap-0.5 ${role.isActive ? 'text-[#4CAF50]' : 'text-red-500'}`}>
                              {role.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                              {role.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          {userInfo && (
                            <p className="text-[9px] text-[#8A8A8A] mt-0.5">
                              {userInfo.points} puntos
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Acciones en móvil - stacked */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCollaborator(role.email);
                            setShowHistory(true);
                          }}
                          className="flex-1 min-w-[80px] p-1.5 bg-[#4FC3F7] hover:bg-[#039BE5] text-white rounded-md transition-colors text-[10px] font-medium flex items-center justify-center gap-1"
                          title="Ver historial"
                        >
                          <History size={12} />
                          <span>Historial ({collaboratorHistory.length})</span>
                        </button>

                        <button
                          onClick={() => toggleCollaboratorStatus(role.id, role.isActive)}
                          className={`p-1.5 rounded-md transition-colors ${
                            role.isActive 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-[#4CAF50] hover:bg-[#45a049] text-white'
                          }`}
                          title={role.isActive ? 'Inactivar' : 'Activar'}
                        >
                          {role.isActive ? <PowerOff size={12} /> : <Power size={12} />}
                        </button>

                        <button
                          onClick={() => deleteCollaborator(role.id, role.email)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 overflow-y-auto">
            <div className="bg-[#F5F5F5] rounded-lg border border-[#D0D0D0] w-full max-w-3xl my-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="p-3 border-b border-[#D0D0D0] flex items-center justify-between sticky top-0 bg-[#F5F5F5] z-10">
                <h3 className="text-sm font-medium text-[#2A2A2A] flex items-center gap-1.5 truncate">
                  <History size={14} className="shrink-0" />
                  <span className="truncate">Historial de {selectedCollaborator}</span>
                </h3>
                <button
                  onClick={() => {
                    setShowHistory(false);
                    setSelectedCollaborator(null);
                  }}
                  className="p-1.5 bg-[#8A8A8A] hover:bg-[#666666] text-white rounded-md transition-colors shrink-0"
                >
                  <XCircle size={14} />
                </button>
              </div>
              
              <div className="p-3 max-h-[60vh] overflow-y-auto">
                {getCollaboratorHistory(selectedCollaborator).length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="mx-auto text-[#D0D0D0] mb-2" size={32} />
                    <p className="text-[#8A8A8A] text-xs font-light">No hay actividades registradas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getCollaboratorHistory(selectedCollaborator).map((action) => (
                      <div key={action.id} className="bg-white rounded-md p-3 border border-[#D0D0D0]">
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 rounded-md shrink-0 ${
                            action.pointsChanged > 0 ? 'bg-[#4CAF50]/10' : 'bg-red-500/10'
                          }`}>
                            <Activity className={`${
                              action.pointsChanged > 0 ? 'text-[#4CAF50]' : 'text-red-500'
                            }`} size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs text-[#2A2A2A] font-medium">{action.action}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 ${
                                action.pointsChanged > 0 
                                  ? 'bg-[#4CAF50]/10 text-[#4CAF50]' 
                                  : 'bg-red-500/10 text-red-500'
                              }`}>
                                {action.pointsChanged > 0 ? '+' : ''}{action.pointsChanged} pts
                              </span>
                            </div>
                            <p className="text-[10px] text-[#5A5A5A] font-light mb-1 break-words">{action.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] text-[#8A8A8A]">
                              <span className="break-all">Usuario: {action.targetUser}</span>
                              <span className="flex items-center gap-0.5 shrink-0">
                                <Clock size={9} />
                                {action.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A'}
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