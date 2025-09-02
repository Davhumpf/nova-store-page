// src/components/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { UserProfile } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Package, BarChart3, UserPlus, Activity, Lock, ArrowRight, BadgePercent
} from 'lucide-react';

type ExtUser = UserProfile & { id: string };
type Product = { id: string; inStock: boolean };

const ADMIN_EMAILS = ['scpu.v1@gmail.com'];

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 sm:p-4">
    <p className="text-[11px] sm:text-xs text-slate-400">{label}</p>
    <p className="text-lg sm:text-2xl font-bold text-yellow-400 leading-tight">{value}</p>
  </div>
);

const Tile: React.FC<{
  title: string; desc: string; icon: React.ReactNode; onClick?: () => void; disabled?: boolean; badge?: string;
}> = ({ title, desc, icon, onClick, disabled, badge }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left rounded-xl border p-4 sm:p-5 transition-all
    ${disabled
      ? 'border-slate-700/40 bg-slate-800/50 opacity-60'
      : 'border-slate-700/60 bg-slate-900/60 hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-400/10'}`}
  >
    <div className="flex items-start gap-4">
      <div className="p-2.5 rounded-lg bg-slate-800 text-slate-100">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-100">{title}</h3>
          {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">{badge}</span>}
        </div>
        <p className="mt-1 text-sm text-slate-300">{desc}</p>
        <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
          <span>Administrar</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  </button>
);

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [u, setU] = useState<ExtUser[]>([]);
  const [p, setP] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!ADMIN_EMAILS.includes(user.email || '')) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const uq = await getDocs(query(collection(db, 'users'), orderBy('email')));
        const users: ExtUser[] = [];
        uq.forEach(d => users.push({ id: d.id, ...(d.data() as UserProfile) }));
        const pq = await getDocs(query(collection(db, 'products'), orderBy('name')));
        const prods: Product[] = [];
        pq.forEach(d => prods.push({ id: d.id, ...(d.data() as any) }));
        if (!active) return;
        setU(users);
        setP(prods);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const totalUsers = u.length;
    const totalProducts = p.length;
    const inStock = p.filter(x => x.inStock).length;
    const totalPoints = u.reduce((s, x) => s + (x.points || 0), 0);
    const avgPoints = totalUsers ? Math.round(totalPoints / totalUsers) : 0;
    return { totalUsers, totalProducts, inStock, totalPoints, avgPoints };
  }, [u, p]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400/30 border-t-yellow-400 animate-spin" />
          <p className="text-slate-300 text-sm">Cargando panel…</p>
        </div>
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-900 px-4">
        <div className="max-w-sm w-full p-6 rounded-2xl border border-slate-700 bg-slate-900/70 text-center">
          <div className="mx-auto w-12 h-12 rounded-full grid place-items-center bg-red-500/20 mb-3">
            <Lock className="text-red-400" size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">Acceso restringido</h2>
          <p className="text-slate-400 text-sm">No tienes permisos para este panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-4 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-6xl">

        {/* Header responsive */}
        <div className="rounded-2xl border border-slate-700/60 overflow-hidden mb-5">
          <div className="bg-yellow-400/90 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/15">
                <Shield size={22} className="text-black" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-extrabold text-black leading-tight">Panel de Administración</h1>
                <p className="text-black/70 text-xs sm:text-sm">Centro de control del sistema</p>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-slate-900/60">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Stat label="Total Usuarios" value={stats.totalUsers} />
              <Stat label="Productos" value={`${stats.inStock}/${stats.totalProducts}`} />
              <Stat label="Total Puntos" value={stats.totalPoints.toLocaleString()} />
              <Stat label="Promedio Puntos" value={stats.avgPoints} />
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Tile
            title="Gestión de Usuarios"
            desc="Administra usuarios, roles y puntos."
            icon={<Users size={20} />}
            onClick={() => navigate('/admin/users')}
          />
          <Tile
            title="Gestión de Productos"
            desc="Crea y edita productos del catálogo."
            icon={<Package size={20} />}
            onClick={() => navigate('/admin/products')}
          />
        </div>

        {/* Acciones secundarias */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Tile
            title="Recompensas"
            desc="Crear y administrar recompensas."
            icon={<BadgePercent size={20} />}
            onClick={() => navigate('/admin/coupons')}
          />
          <Tile
            title="Gestión de Colaboradores"
            desc="Permisos y miembros del equipo."
            icon={<UserPlus size={20} />}
            onClick={() => navigate('/admin/colaborators')}
          />
        </div>

        {/* Footer sesión */}
        <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Shield size={16} />
              <span>Sesión administrativa activa — {user.email}</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="self-start sm:self-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Activity size={14} className="text-green-400" />
          <span>Última actualización al abrir el panel.</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
