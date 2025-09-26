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
  Loader,
  Lock,
  Users,
  Save,
  Star,
  Eye,
  ArrowLeft,
  Shield,
  UserCheck,
  Copy as CopyIcon,
  Trash2,
  Hash,
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

  // --------- Acceso (super_admin, admin o collaborator activo) ----------
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --------- Carga de usuarios (fallback si falta índice) ----------
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

  // --------- Filtro memo ----------
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

  // --------- Puntos ----------
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

  // --------- Copiar texto ----------
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --------- Borrar usuario (doc en Firestore) ----------
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

  // --------- Loading ----------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="flex flex-col items-center p-8 bg-[#2C2C2C] rounded-xl shadow-2xl border border-gray-700/50">
          <div className="w-14 h-14 border-4 border-[#FFD600]/20 border-t-[#FFD600] rounded-full animate-spin" />
          <p className="mt-4 text-[#FFD600] font-bold">Cargando gestión de usuarios…</p>
        </div>
      </div>
    );
  }

  // --------- Acceso denegado ----------
  if (!user || !userRole || !['super_admin', 'admin', 'collaborator'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-700/50">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6">
              <Lock size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Acceso Restringido</h2>
            <p className="text-gray-300 mb-6">No tienes permisos para esta sección.</p>
            <div className="flex items-center gap-2 text-[#FFD600] font-medium">
              <Shield size={16} />
              <span>Área protegida</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------- Helpers UI ----------
  const roleTitle =
    userRole === 'super_admin'
      ? 'Gestión de Usuarios — Super Admin'
      : userRole === 'admin'
      ? 'Gestión de Usuarios — Admin'
      : 'Gestión de Usuarios — Colaborador';

  const roleIcon =
    userRole === 'collaborator' ? (
      <UserCheck className="text-[#FFD600]" size={18} />
    ) : (
      <Shield className="text-[#FFD600]" size={18} />
    );

  // --------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] pt-[env(safe-area-inset-top)] py-3 px-2 sm:px-4">
      <div className="mx-auto w-full max-w-7xl">

        {/* Header compacto */}
        <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 mb-3 sm:mb-5">
          <div className="p-2.5 sm:p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 bg-[#FFD600]/10 hover:bg-[#FFD600]/20 rounded-lg shrink-0"
                title="Volver"
              >
                <ArrowLeft size={18} className="text-[#FFD600]" />
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {roleIcon}
                <h1 className="text-sm sm:text-xl font-bold text-white truncate">
                  {roleTitle}
                </h1>
              </div>
            </div>

            <div className="hidden xs:flex items-center gap-3">
              <div className="text-center">
                <p className="text-gray-400 text-[11px] sm:text-xs">Total</p>
                <p className="text-[#FFD600] text-sm sm:text-base font-bold">{users.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-[11px] sm:text-xs">Mostrando</p>
                <p className="text-[#FFD600] text-sm sm:text-base font-bold">{filteredUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid lg:grid-cols-3 gap-3 sm:gap-5">
          {/* Lista */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-700/50 p-3 sm:p-4">
              {/* Buscador */}
              <div className="relative mb-3 sm:mb-5">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por email, nombre o ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-gray-700/50 rounded-xl py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 text-[15px] sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50"
                />
              </div>

              {/* Lista compacta */}
              <div className="space-y-2.5 sm:space-y-3 max-h-[62vh] sm:max-h-[70vh] overflow-y-auto pr-0.5 touch-pan-y select-none">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left p-2.5 sm:p-3.5 rounded-xl border transition-all ${
                      selectedUser?.id === u.id
                        ? 'bg-[#FFD600]/10 border-[#FFD600]/50'
                        : 'bg-[#1a1a1a]/60 border-gray-700/30 hover:border-[#FFD600]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-[#FFD600] to-[#FFC400] rounded-full grid place-items-center shrink-0">
                          <span className="text-black font-extrabold text-xs sm:text-sm">
                            {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-white font-semibold text-[13px] sm:text-base truncate">
                            {u.email}
                          </p>
                          <div className="flex items-center gap-2">
                            {!!u.name && (
                              <p className="text-gray-400 text-[11px] sm:text-xs truncate">{u.name}</p>
                            )}
                            {/* Mini badge con inicio del ID */}
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-300 bg-[#111]/60 border border-gray-700/50 rounded-full px-1.5 py-0.5">
                              <Hash size={12} className="text-[#FFD600]" />
                              {u.id.slice(0, 6)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1 bg-[#FFD600]/15 px-2 py-0.5 rounded-full">
                          <Award size={13} className="text-[#FFD600]" />
                          <span className="text-[#FFD600] font-bold text-[11px] sm:text-sm">
                            {u.points || 0}
                          </span>
                        </div>
                        {selectedUser?.id === u.id && (
                          <div className="w-2 h-2 bg-[#FFD600] rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-10">
                    <Users size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">No se encontraron usuarios</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-700/50 p-3.5 sm:p-5 lg:sticky lg:top-4">
              {selectedUser ? (
                <>
                  <div className="text-center mb-4 sm:mb-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#FFD600] to-[#FFC400] rounded-full grid place-items-center shadow-lg mx-auto mb-2.5">
                      <span className="text-black font-bold text-lg sm:text-xl">
                        {(selectedUser.name?.[0] || selectedUser.email?.[0] || '?').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-sm sm:text-lg break-all">
                      {selectedUser.email}
                    </h3>
                    {!!selectedUser.name && (
                      <p className="text-gray-400 text-xs sm:text-sm">{selectedUser.name}</p>
                    )}

                    {/* ID + copiar */}
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-[#111]/60 border border-gray-700/50 rounded-lg px-2 py-1 text-[11px] sm:text-xs text-gray-300">
                        <Hash size={12} className="text-[#FFD600]" />
                        <code className="break-all">{selectedUser.id}</code>
                      </span>
                      <button
                        onClick={() => copy(selectedUser.id)}
                        className="inline-flex items-center gap-1 bg-[#FFD600]/10 hover:bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/30 rounded-lg px-2 py-1 text-[11px] sm:text-xs"
                        title="Copiar ID"
                      >
                        <CopyIcon size={14} />
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a]/50 rounded-xl p-3.5 sm:p-4 mb-4 sm:mb-5">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <Star className="text-[#FFD600]" size={16} />
                      <span className="text-gray-400 text-xs sm:text-sm">Puntos actuales</span>
                    </div>
                    <p className="text-[#FFD600] font-extrabold text-2xl sm:text-3xl text-center">
                      {selectedUser.points || 0}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-400 text-xs sm:text-sm font-medium mb-1.5">
                        Puntos a añadir/quitar
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPointsToAdd((p) => p - 10)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                          type="button"
                          title="-10"
                        >
                          <MinusCircle size={18} className="text-red-400" />
                        </button>

                        <input
                          type="number"
                          value={pointsToAdd}
                          onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                          className="flex-1 bg-[#1a1a1a] border border-gray-700/50 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50"
                        />

                        <button
                          onClick={() => setPointsToAdd((p) => p + 10)}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg"
                          type="button"
                          title="+10"
                        >
                          <PlusCircle size={18} className="text-green-400" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[10, 50, 100].map((v) => (
                        <button
                          key={`p-${v}`}
                          onClick={() => setPointsToAdd(v)}
                          type="button"
                          className="py-2 px-2.5 bg-[#FFD600]/10 hover:bg-[#FFD600]/20 border border-[#FFD600]/30 rounded-lg text-[#FFD600] text-xs sm:text-sm font-medium"
                        >
                          +{v}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[-10, -50, -100].map((v) => (
                        <button
                          key={`n-${v}`}
                          onClick={() => setPointsToAdd(v)}
                          type="button"
                          className="py-2 px-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm font-medium"
                        >
                          {v}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleAddPoints}
                      disabled={pointsToAdd === 0 || isUpdating}
                      className="w-full bg-gradient-to-r from-[#FFD600] to-[#FFC400] hover:from-[#FFC400] hover:to-[#FFB800] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-2.5 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      {isUpdating ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                      {isUpdating ? 'Actualizando…' : 'Aplicar cambios'}
                    </button>

                    {canDelete && (
                      <button
                        onClick={handleDeleteUser}
                        disabled={isUpdating}
                        className="w-full mt-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                        title="Eliminar documento del usuario"
                      >
                        <Trash2 size={16} />
                        Eliminar usuario (doc)
                      </button>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-[#1a1a1a]/30 rounded-xl text-center">
                    <p className="text-[11px] sm:text-xs text-gray-400">
                      Nuevos puntos: {(selectedUser.points || 0) + pointsToAdd}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-9 sm:py-12">
                  <Eye size={40} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm sm:text-base font-medium mb-1">
                    Selecciona un usuario
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Toca un usuario de la lista para gestionar sus puntos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer sesión */}
        <div className="mt-3 sm:mt-5 bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-xl p-3 sm:p-4 border border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#FFD600] font-medium text-xs sm:text-sm">
              {roleIcon}
              <span>
                Sesión activa como{' '}
                {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'} — {user?.email}
              </span>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] text-black px-4 sm:px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#FFD600]/25 transition"
            >
              Volver al panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
