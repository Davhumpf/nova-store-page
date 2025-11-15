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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.5)] p-6">
          <div className="w-10 h-10 border-3 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full animate-spin"></div>
          <p className="mt-2 text-pop-purple font-black uppercase tracking-wide text-xs">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-3 px-3 sm:px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Botón volver estilo Apple */}
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 flex items-center gap-1.5 text-xs text-pop-purple hover:text-pop-orange transition-colors group font-black uppercase tracking-wide"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-black">Panel Admin</span>
        </button>

        {/* Header minimalista */}
        <div className="mb-4 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.5)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-8 bg-pop-purple rounded-full shadow-sm"></div>
            <div className="flex-1">
              <h1 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wide">Gestión de Colaboradores</h1>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase">Administra roles y permisos del equipo</p>
            </div>
            <div className="flex gap-3 text-center">
              <div className="border-2 border-black dark:border-white px-2 py-1 bg-white dark:bg-black">
                <p className="text-[9px] text-gray-600 dark:text-gray-400 font-bold uppercase">Total</p>
                <p className="text-sm font-black text-pop-purple">{roles.length}</p>
              </div>
              <div className="border-2 border-black dark:border-white px-2 py-1 bg-white dark:bg-black">
                <p className="text-[9px] text-gray-600 dark:text-gray-400 font-bold uppercase">Activos</p>
                <p className="text-sm font-black text-pop-orange">{roles.filter(r => r.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de feedback */}
        {message && (
          <div className="mb-3 p-2.5 border-4 border-black dark:border-white bg-white dark:bg-black flex items-center gap-2 text-xs shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
            {message.type === 'success' ? <CheckCircle size={14} className="text-pop-orange" /> :
             message.type === 'error' ? <XCircle size={14} className="text-pop-pink" /> :
             <Activity size={14} className="text-pop-purple" />}
            <span className={`font-black uppercase tracking-wide ${
              message.type === 'success' ? 'text-pop-orange' :
              message.type === 'error' ? 'text-pop-pink' :
              'text-pop-purple'
            }`}>{message.text}</span>
          </div>
        )}

        {/* Controles de búsqueda y agregar */}
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)] p-3 mb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Buscador */}
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-pop-purple dark:text-pop-pink" size={14} />
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Buscar por correo..."
                className="comic-input w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 font-semibold"
              />
            </div>

            {/* Botón agregar */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="border-4 border-black dark:border-white bg-white dark:bg-black text-pop-purple hover:text-pop-orange px-4 py-2 text-xs font-black flex items-center justify-center gap-1.5 uppercase tracking-wide shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>

          {/* Formulario de agregar */}
          {showAddForm && (
            <div className="mt-3 p-3 border-2 border-black dark:border-white bg-white dark:bg-black">
              <h3 className="text-xs text-gray-900 dark:text-white font-black mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Mail size={12} />
                Nuevo Colaborador
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="comic-input flex-1 px-3 py-2 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 font-semibold"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCollaborator}
                    disabled={isAdding}
                    className="border-4 border-black dark:border-white bg-white dark:bg-black text-pop-orange hover:text-pop-purple disabled:opacity-50 px-4 py-2 text-xs font-black uppercase tracking-wide flex items-center gap-1 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
                  >
                    {isAdding ? <Loader className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                    {isAdding ? 'Agregando...' : 'Agregar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCollaboratorEmail('');
                    }}
                    className="border-4 border-black dark:border-white bg-white dark:bg-black text-[#8A8A8A] dark:text-gray-400 hover:text-black dark:hover:text-white px-3 py-2 text-xs font-black uppercase tracking-wide shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de colaboradores */}
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.5)]">
          <div className="p-3 border-b-4 border-black dark:border-white bg-white dark:bg-black">
            <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
              <Shield size={14} />
              Colaboradores ({filteredRoles.length})
            </h2>
          </div>

          {filteredRoles.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-pop-purple dark:text-pop-pink mb-2" size={32} />
              <p className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wide">
                {searchEmail ? 'No se encontraron colaboradores' : 'No hay colaboradores registrados'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRoles.map((role) => {
                const userInfo = users.find(u => u.email === role.email);
                const collaboratorHistory = getCollaboratorHistory(role.email);
                
                return (
                  <div key={role.id} className="p-3 border-b-2 border-black dark:border-white last:border-b-0 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)_inset] dark:hover:shadow-[4px_4px_0px_rgba(255,255,255,0.5)_inset] transition-all">
                    <div className="flex flex-col gap-2">
                      {/* Info */}
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 border-2 border-black dark:border-white shrink-0 bg-white dark:bg-black`}>
                          <Mail className={`${role.isActive ? 'text-pop-orange' : 'text-pop-pink'}`} size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs text-gray-900 dark:text-white font-black break-all uppercase tracking-wide">{role.email}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                            <span className="font-bold uppercase">{role.role}</span>
                            <span className={`flex items-center gap-0.5 font-black ${role.isActive ? 'text-pop-orange' : 'text-pop-pink'}`}>
                              {role.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                              {role.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          {userInfo && (
                            <p className="text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 font-bold">
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
                          className="flex-1 min-w-[80px] p-1.5 border-2 border-black dark:border-white bg-white dark:bg-black text-pop-purple hover:text-pop-orange text-[10px] font-black flex items-center justify-center gap-1 uppercase tracking-wide hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] transition-all"
                          title="Ver historial"
                        >
                          <History size={12} />
                          <span>Historial ({collaboratorHistory.length})</span>
                        </button>

                        <button
                          onClick={() => toggleCollaboratorStatus(role.id, role.isActive)}
                          className={`p-1.5 border-2 border-black dark:border-white bg-white dark:bg-black hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] transition-all ${
                            role.isActive ? 'text-pop-orange' : 'text-pop-purple'
                          }`}
                          title={role.isActive ? 'Inactivar' : 'Activar'}
                        >
                          {role.isActive ? <PowerOff size={12} /> : <Power size={12} />}
                        </button>

                        <button
                          onClick={() => deleteCollaborator(role.id, role.email)}
                          className="p-1.5 border-2 border-black dark:border-white bg-white dark:bg-black text-pop-pink hover:text-pop-red hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] transition-all"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 overflow-y-auto backdrop-blur-sm">
            <div className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_rgba(0,0,0,0.8)] dark:shadow-[12px_12px_0px_rgba(255,255,255,0.5)] w-full max-w-3xl my-4">
              <div className="p-3 border-b-4 border-black dark:border-white flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10">
                <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5 truncate uppercase tracking-wide">
                  <History size={14} className="shrink-0 text-pop-purple" />
                  <span className="truncate">Historial de {selectedCollaborator}</span>
                </h3>
                <button
                  onClick={() => {
                    setShowHistory(false);
                    setSelectedCollaborator(null);
                  }}
                  className="p-1.5 border-2 border-black dark:border-white bg-white dark:bg-black text-[#8A8A8A] dark:text-gray-400 hover:text-black dark:hover:text-white hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] shrink-0 transition-all"
                >
                  <XCircle size={14} />
                </button>
              </div>
              
              <div className="p-3 max-h-[60vh] overflow-y-auto">
                {getCollaboratorHistory(selectedCollaborator).length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="mx-auto text-pop-purple dark:text-pop-pink mb-2" size={32} />
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wide">No hay actividades registradas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getCollaboratorHistory(selectedCollaborator).map((action) => (
                      <div key={action.id} className="border-4 border-black dark:border-white bg-white dark:bg-black p-3 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[4px_4px_0px_rgba(255,255,255,0.5)] transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.5)]">
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 border-2 border-black dark:border-white shrink-0 bg-white dark:bg-black`}>
                            <Activity className={`${
                              action.pointsChanged > 0 ? 'text-pop-orange' : 'text-pop-pink'
                            }`} size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs text-gray-900 dark:text-white font-black uppercase tracking-wide">{action.action}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 border-2 border-black dark:border-white shrink-0 font-black bg-white dark:bg-black ${
                                action.pointsChanged > 0 ? 'text-pop-orange' : 'text-pop-pink'
                              }`}>
                                {action.pointsChanged > 0 ? '+' : ''}{action.pointsChanged} pts
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1 break-words">{action.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] text-gray-600 dark:text-gray-400">
                              <span className="break-all font-bold">Usuario: {action.targetUser}</span>
                              <span className="flex items-center gap-0.5 shrink-0 font-bold">
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