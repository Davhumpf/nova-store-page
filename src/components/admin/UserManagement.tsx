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
      <div className="min-h-screen flex items-center justify-center bg-[#E8E8E8]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#BA68C8]/30 border-t-[#BA68C8] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#8A8A8A] text-sm font-light">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole || !['super_admin', 'admin', 'collaborator'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8E8E8] p-4">
        <div className="bg-[#F5F5F5] rounded-lg border border-[#D0D0D0] p-6 max-w-md w-full shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h2 className="text-lg font-semibold text-[#2A2A2A] mb-2">Acceso Restringido</h2>
            <p className="text-sm text-[#8A8A8A] mb-4">No tienes permisos para esta sección.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#BA68C8] hover:bg-[#9C27B0] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
    <div className="min-h-screen bg-[#E8E8E8] py-3 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Botón volver */}
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 flex items-center gap-1.5 text-xs text-[#BA68C8] hover:text-[#9C27B0] transition-colors group"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Panel Admin</span>
        </button>

        {/* Header minimalista */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-8 bg-[#BA68C8] rounded-full shadow-sm"></div>
            <div className="flex-1">
              <h1 className="text-lg font-light text-[#2A2A2A]">Gestión de Usuarios</h1>
              <p className="text-[10px] text-[#8A8A8A] font-light">Rol: {roleTitle} • {user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-[9px] text-[#8A8A8A]">Total</p>
                <p className="text-sm font-bold text-[#BA68C8]">{users.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-[#8A8A8A]">Mostrando</p>
                <p className="text-sm font-bold text-[#BA68C8]">{filteredUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid lg:grid-cols-3 gap-3">
          {/* Lista de usuarios */}
          <div className="lg:col-span-2">
            <div className="bg-[#F5F5F5] rounded-lg border border-[#D0D0D0] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              {/* Buscador */}
              <div className="p-3 border-b border-[#D0D0D0]">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#8A8A8A]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por email, nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-[#D0D0D0] rounded-md py-2 pl-10 pr-3 text-xs text-[#2A2A2A] placeholder-[#8A8A8A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="p-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto text-[#D0D0D0] mb-2" size={32} />
                    <p className="text-[#8A8A8A] text-xs font-light">No se encontraron usuarios</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`w-full text-left p-2.5 rounded-md border transition-all ${
                          selectedUser?.id === u.id
                            ? 'bg-[#BA68C8]/10 border-[#BA68C8]'
                            : 'bg-white border-[#D0D0D0] hover:border-[#BA68C8]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 bg-[#BA68C8] rounded-full grid place-items-center shrink-0">
                              <span className="text-white font-bold text-sm">
                                {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="text-[#2A2A2A] font-semibold text-xs truncate">
                                {u.email}
                              </p>
                              <div className="flex items-center gap-1.5">
                                {!!u.name && (
                                  <p className="text-[#8A8A8A] text-[10px] truncate">{u.name}</p>
                                )}
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-[#8A8A8A] bg-gray-100 rounded px-1 py-0.5">
                                  <Hash size={10} className="text-[#BA68C8]" />
                                  {u.id.slice(0, 6)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-[#BA68C8]/10 px-2 py-1 rounded">
                              <Award size={11} className="text-[#BA68C8]" />
                              <span className="text-[#BA68C8] font-bold text-[10px]">
                                {u.points || 0}
                              </span>
                            </div>
                            {selectedUser?.id === u.id && (
                              <div className="w-1.5 h-1.5 bg-[#BA68C8] rounded-full"></div>
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
            <div className="bg-[#F5F5F5] rounded-lg border border-[#D0D0D0] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] lg:sticky lg:top-4">
              {selectedUser ? (
                <div className="space-y-4">
                  {/* Usuario seleccionado */}
                  <div className="text-center">
                    <div className="w-14 h-14 bg-[#BA68C8] rounded-full grid place-items-center shadow-md mx-auto mb-2">
                      <span className="text-white font-bold text-lg">
                        {(selectedUser.name?.[0] || selectedUser.email?.[0] || '?').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-[#2A2A2A] font-semibold text-sm break-all mb-1">
                      {selectedUser.email}
                    </h3>
                    {!!selectedUser.name && (
                      <p className="text-[#8A8A8A] text-xs">{selectedUser.name}</p>
                    )}

                    {/* ID con botón copiar */}
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-white border border-[#D0D0D0] rounded px-2 py-1 text-[10px] text-[#8A8A8A]">
                        <Hash size={10} className="text-[#BA68C8]" />
                        <code className="break-all">{selectedUser.id.slice(0, 12)}...</code>
                      </span>
                      <button
                        onClick={() => copy(selectedUser.id)}
                        className="inline-flex items-center gap-1 bg-[#BA68C8]/10 hover:bg-[#BA68C8]/20 text-[#BA68C8] border border-[#BA68C8]/30 rounded px-2 py-1 text-[10px] transition-colors"
                        title="Copiar ID completo"
                      >
                        <CopyIcon size={10} />
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Puntos actuales */}
                  <div className="bg-white rounded-md p-3 border border-[#D0D0D0]">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Award className="text-[#BA68C8]" size={14} />
                      <span className="text-[#8A8A8A] text-[10px] font-light">Puntos actuales</span>
                    </div>
                    <p className="text-[#BA68C8] font-bold text-2xl text-center">
                      {selectedUser.points || 0}
                    </p>
                  </div>

                  {/* Control de puntos */}
                  <div>
                    <label className="block text-[#8A8A8A] text-[10px] font-light mb-1.5">
                      Ajustar puntos
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setPointsToAdd((p) => p - 10)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-md border border-red-500/30 transition-colors"
                        type="button"
                        title="-10"
                      >
                        <MinusCircle size={16} className="text-red-500" />
                      </button>

                      <input
                        type="number"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                        className="flex-1 bg-white border border-[#D0D0D0] rounded-md py-2 px-3 text-xs text-[#2A2A2A] text-center focus:border-[#BA68C8] focus:outline-none transition-colors"
                      />

                      <button
                        onClick={() => setPointsToAdd((p) => p + 10)}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-md border border-green-500/30 transition-colors"
                        type="button"
                        title="+10"
                      >
                        <PlusCircle size={16} className="text-green-500" />
                      </button>
                    </div>

                    {/* Atajos rápidos positivos */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      {[10, 50, 100].map((v) => (
                        <button
                          key={`p-${v}`}
                          onClick={() => setPointsToAdd(v)}
                          type="button"
                          className="py-1.5 bg-[#BA68C8]/10 hover:bg-[#BA68C8]/20 border border-[#BA68C8]/30 rounded text-[#BA68C8] text-[10px] font-medium transition-colors"
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
                          className="py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded text-red-500 text-[10px] font-medium transition-colors"
                        >
                          {v}
                        </button>
                      ))}
                    </div>

                    {/* Botón aplicar */}
                    <button
                      onClick={handleAddPoints}
                      disabled={pointsToAdd === 0 || isUpdating}
                      className="w-full bg-[#BA68C8] hover:bg-[#9C27B0] disabled:bg-[#D0D0D0] disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors shadow-[0_2px_8px_rgba(186,104,200,0.25)] disabled:shadow-none"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                        className="w-full mt-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-medium py-2.5 rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors"
                        title="Eliminar documento del usuario"
                      >
                        <Trash2 size={14} />
                        Eliminar usuario
                      </button>
                    )}
                  </div>

                  {/* Preview de nuevos puntos */}
                  <div className="bg-white rounded-md p-2.5 border border-[#D0D0D0] text-center">
                    <p className="text-[10px] text-[#8A8A8A] mb-0.5">Resultado final</p>
                    <p className="text-sm font-bold text-[#2A2A2A]">
                      {(selectedUser.points || 0) + pointsToAdd} pts
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto text-[#D0D0D0] mb-3" size={40} />
                  <p className="text-[#8A8A8A] text-sm font-medium mb-1">
                    Selecciona un usuario
                  </p>
                  <p className="text-[#8A8A8A] text-xs font-light">
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