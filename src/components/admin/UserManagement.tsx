// src/components/admin/UserManagement.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { UserProfile, addPointsToUser } from '../../services/UserService';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Award,
  PlusCircle,
  MinusCircle,
  Save,
  ArrowRight,
  Users,
  Hash,
  Copy as CopyIcon,
  Trash2,
} from 'lucide-react';

interface ExtendedUserProfile extends UserProfile {
  id: string;
  name?: string;
}

const ADMIN_EMAILS = ['scpu.v1@gmail.com'];

const UserManagement: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
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
          navigate('/', { replace: true });
          return;
        }
        if (ADMIN_EMAILS.includes(user.email)) {
          setUserRole('super_admin');
          await fetchUsers();
          return;
        }
        const rolesRef = collection(db, 'roles');
        const qRoles = query(rolesRef, where('email', '==', user.email));
        const rolesSnap = await getDocs(qRoles);
        if (!rolesSnap.empty) {
          const roleData = rolesSnap.docs[0].data() as any;
          if (roleData?.isActive && ['admin', 'collaborator'].includes(roleData?.role)) {
            setUserRole(roleData.role);
            await fetchUsers();
            return;
          }
        }
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Error al verificar acceso:', err);
        navigate('/', { replace: true });
      }
    };
    checkAccess();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      let snap;
      try {
        snap = await getDocs(query(usersRef, orderBy('email')));
      } catch (e) {
        console.warn('orderBy(email) falló; usando carga sin ordenar:', e);
        snap = await getDocs(usersRef);
      }
      const list: ExtendedUserProfile[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as UserProfile) }));
      setUsers(list);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return users;
    return users.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(t) ||
        (u.name || '').toLowerCase().includes(t) ||
        (u.id || '').toLowerCase().includes(t)
    );
  }, [searchTerm, users]);

  const handleAddPoints = async () => {
    if (!selectedUser || pointsToAdd === 0) return;
    setIsUpdating(true);
    try {
      await addPointsToUser(selectedUser.id, pointsToAdd);
      const updated = users.map((u) =>
        u.id === selectedUser.id ? { ...u, points: (u.points || 0) + pointsToAdd } : u
      );
      setUsers(updated);
      setSelectedUser((prev) =>
        prev ? { ...prev, points: (prev.points || 0) + pointsToAdd } : prev
      );
      setPointsToAdd(0);
    } catch (err) {
      console.error('Error al añadir puntos:', err);
      alert('No se pudo aplicar el cambio de puntos.');
    } finally {
      setIsUpdating(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const canDelete = userRole === 'super_admin' || userRole === 'admin';

  const handleDeleteUser = async () => {
    if (!selectedUser || !canDelete) return;
    const ok = window.confirm(
      `¿Eliminar el documento del usuario?\n\nEmail: ${selectedUser.email}\nID: ${selectedUser.id}\n\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;

    setIsUpdating(true);
    try {
      await deleteDoc(doc(db, 'users', selectedUser.id));
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('No se pudo eliminar el documento del usuario.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-pop-pink font-bold text-sm">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole || !['super_admin', 'admin', 'collaborator'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-6 max-w-md w-full shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.5)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h2 className="text-lg font-semibold text-pop-red mb-2">Acceso Restringido</h2>
            <p className="text-sm text-[#8A8A8A] dark:text-gray-400 mb-4">No tienes permisos para esta sección.</p>
            <button
              onClick={() => navigate('/')}
              className="border-4 border-black dark:border-white bg-white dark:bg-black text-pop-purple hover:text-pop-pink font-black uppercase px-4 py-2 text-sm transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleTitle =
    userRole === 'super_admin'
      ? 'Super Admin'
      : userRole === 'admin'
      ? 'Admin'
      : 'Colaborador';

  return (
    <div className="min-h-screen bg-white dark:bg-black py-3 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-7xl">

        {/* Botón volver */}
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 flex items-center gap-1.5 text-xs text-pop-pink hover:text-pop-purple transition-colors group"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Panel Admin</span>
        </button>

        {/* Header minimalista */}
        <div className="mb-4 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.5)] p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-8 bg-pop-pink rounded-full shadow-sm"></div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[#2A2A2A] dark:text-white comic-text-shadow uppercase">Gestión de Usuarios</h1>
              <p className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-medium">Rol: {roleTitle} • {user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-[9px] text-[#8A8A8A] dark:text-gray-400">Total</p>
                <p className="text-sm font-bold text-pop-pink">{users.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-[#8A8A8A] dark:text-gray-400">Mostrando</p>
                <p className="text-sm font-bold text-pop-pink">{filteredUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid lg:grid-cols-3 gap-3">
          {/* Lista de usuarios */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.5)]">
              {/* Buscador */}
              <div className="p-3 border-b-4 border-black dark:border-white bg-white dark:bg-black">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#8A8A8A] dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por email, nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="comic-input w-full py-2 pl-10 pr-3 text-xs"
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="p-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto text-[#D0D0D0] dark:text-gray-600 mb-2" size={32} />
                    <p className="text-[#8A8A8A] dark:text-gray-400 text-xs font-light">No se encontraron usuarios</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`w-full text-left p-2.5 border-2 border-black dark:border-white transition-all ${
                          selectedUser?.id === u.id
                            ? 'bg-white dark:bg-black shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]'
                            : 'bg-white dark:bg-black hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 border-2 border-black dark:border-white bg-white dark:bg-black rounded-full grid place-items-center shrink-0">
                              <span className="text-pop-purple font-bold text-sm">
                                {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="text-[#2A2A2A] dark:text-white font-semibold text-xs truncate">
                                {u.email}
                              </p>
                              <div className="flex items-center gap-1.5">
                                {!!u.name && (
                                  <p className="text-[#8A8A8A] dark:text-gray-400 text-[10px] truncate">{u.name}</p>
                                )}
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-[#8A8A8A] dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">
                                  <Hash size={10} className="text-[#BA68C8] dark:text-[#CE93D8]" />
                                  {u.id.slice(0, 6)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white dark:bg-black px-2 py-1 border-2 border-black dark:border-white">
                              <Award size={11} className="text-pop-green" />
                              <span className="text-pop-green font-bold text-[10px]">
                                {u.points || 0}
                              </span>
                            </div>
                            {selectedUser?.id === u.id && (
                              <div className="w-1.5 h-1.5 bg-pop-pink rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel de edición */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.5)] p-4 lg:sticky lg:top-4">
              {selectedUser ? (
                <div className="space-y-4">
                  {/* Usuario seleccionado */}
                  <div className="text-center">
                    <div className="w-14 h-14 border-4 border-black dark:border-white bg-white dark:bg-black rounded-full grid place-items-center mx-auto mb-2">
                      <span className="text-pop-purple font-bold text-lg">
                        {(selectedUser.name?.[0] || selectedUser.email?.[0] || '?').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-[#2A2A2A] dark:text-white font-semibold text-sm break-all mb-1">
                      {selectedUser.email}
                    </h3>
                    {!!selectedUser.name && (
                      <p className="text-[#8A8A8A] dark:text-gray-400 text-xs">{selectedUser.name}</p>
                    )}

                    {/* ID con botón copiar */}
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-white dark:bg-black border-2 border-black dark:border-white px-2 py-1 text-[10px] text-[#8A8A8A] dark:text-gray-400">
                        <Hash size={10} className="text-pop-purple" />
                        <code className="break-all">{selectedUser.id.slice(0, 12)}...</code>
                      </span>
                      <button
                        onClick={() => copy(selectedUser.id)}
                        className="inline-flex items-center gap-1 bg-white dark:bg-black hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] text-pop-purple border-2 border-black dark:border-white px-2 py-1 text-[10px] transition-all"
                        title="Copiar ID completo"
                      >
                        <CopyIcon size={10} />
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Puntos actuales */}
                  <div className="border-4 border-black dark:border-white bg-white dark:bg-black p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Award className="text-pop-green" size={14} />
                      <span className="text-pop-green text-[10px] font-bold uppercase">Puntos actuales</span>
                    </div>
                    <p className="text-pop-green font-bold text-2xl text-center">
                      {selectedUser.points || 0}
                    </p>
                  </div>

                  {/* Control de puntos */}
                  <div>
                    <label className="block text-[#8A8A8A] dark:text-gray-400 text-[10px] font-light mb-1.5">
                      Ajustar puntos
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setPointsToAdd((p) => p - 10)}
                        className="p-2 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 rounded-md border border-red-500/30 dark:border-red-500/40 transition-colors"
                        type="button"
                        title="-10"
                      >
                        <MinusCircle size={16} className="text-red-500 dark:text-red-400" />
                      </button>

                      <input
                        type="number"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                        className="comic-input flex-1 py-2 px-3 text-xs text-center"
                      />

                      <button
                        onClick={() => setPointsToAdd((p) => p + 10)}
                        className="p-2 bg-green-500/10 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/30 rounded-md border border-green-500/30 dark:border-green-500/40 transition-colors"
                        type="button"
                        title="+10"
                      >
                        <PlusCircle size={16} className="text-green-500 dark:text-green-400" />
                      </button>
                    </div>

                    {/* Atajos rápidos positivos */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      {[10, 50, 100].map((v) => (
                        <button
                          key={`p-${v}`}
                          onClick={() => setPointsToAdd(v)}
                          type="button"
                          className="py-1.5 bg-white dark:bg-black hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] border-2 border-black dark:border-white text-pop-green text-[10px] font-bold uppercase transition-all"
                        >
                          +{v}
                        </button>
                      ))}
                    </div>

                    {/* Atajos rápidos negativos */}
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[-10, -50, -100].map((v) => (
                        <button
                          key={`n-${v}`}
                          onClick={() => setPointsToAdd(v)}
                          type="button"
                          className="py-1.5 bg-white dark:bg-black hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] border-2 border-black dark:border-white text-pop-red text-[10px] font-bold uppercase transition-all"
                        >
                          {v}
                        </button>
                      ))}
                    </div>

                    {/* Botón aplicar */}
                    <button
                      onClick={handleAddPoints}
                      disabled={pointsToAdd === 0 || isUpdating}
                      className="w-full border-4 border-black dark:border-white bg-white dark:bg-black text-pop-yellow font-black uppercase py-2.5 flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Aplicar cambios
                        </>
                      )}
                    </button>

                    {/* Botón eliminar (solo admin y super_admin) */}
                    {canDelete && (
                      <button
                        onClick={handleDeleteUser}
                        disabled={isUpdating}
                        className="w-full mt-2 border-4 border-black dark:border-white bg-white dark:bg-black text-pop-red font-black uppercase py-2.5 flex items-center justify-center gap-1.5 text-xs shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
                        title="Eliminar documento del usuario"
                      >
                        <Trash2 size={14} />
                        Eliminar usuario
                      </button>
                    )}
                  </div>

                  {/* Preview de nuevos puntos */}
                  <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-2.5 text-center">
                    <p className="text-[10px] text-[#8A8A8A] dark:text-gray-400 mb-0.5">Resultado final</p>
                    <p className="text-sm font-bold text-pop-cyan">
                      {(selectedUser.points || 0) + pointsToAdd} pts
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto text-[#D0D0D0] dark:text-gray-600 mb-3" size={40} />
                  <p className="text-[#8A8A8A] dark:text-gray-400 text-sm font-medium mb-1">
                    Selecciona un usuario
                  </p>
                  <p className="text-[#8A8A8A] dark:text-gray-400 text-xs font-light">
                    Haz clic en un usuario de la lista
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;