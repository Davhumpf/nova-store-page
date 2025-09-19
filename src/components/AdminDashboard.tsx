// src/components/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { UserProfile } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Package,
  Activity,
  Lock,
  ArrowRight,
  BadgePercent,
} from 'lucide-react';

type ExtUser = UserProfile & { id: string };
type Product = { id: string; inStock?: boolean };

const ADMIN_EMAILS = ['scpu.v1@gmail.com'];

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4">
    <p className="text-[11px] sm:text-xs text-slate-400">{label}</p>
    <p className="text-lg sm:text-2xl font-extrabold text-yellow-400 leading-tight">{value}</p>
  </div>
);

const Tile: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}> = ({ title, desc, icon, onClick, disabled, badge }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group w-full text-left rounded-xl border p-3.5 sm:p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
      disabled
        ? 'border-slate-700/40 bg-slate-800/50 opacity-60'
        : 'border-slate-700/60 bg-slate-900/60 hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-400/10 active:scale-[0.99]'
    }`}
  >
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="p-2 rounded-lg bg-slate-800 text-slate-100 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-100 truncate">{title}</h3>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-300">{desc}</p>
        <div className="mt-3 flex items-center gap-1 text-[11px] sm:text-xs text-slate-400">
          <span className="group-hover:text-yellow-300">Administrar</span>
          <ArrowRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </div>
  </button>
);

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [u, setU] = useState<ExtUser[]>([]);
  const [pd, setPd] = useState<Product[]>([]); // products (digital)
  const [pf, setPf] = useState<Product[]>([]); // products (físicos)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!ADMIN_EMAILS.includes(user.email || '')) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    let active = true;

    const safeGet = async (colName: string, orderField: string) => {
      const ref = collection(db, colName);
      try {
        const qs = await getDocs(query(ref, orderBy(orderField)));
        return qs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
      } catch {
        const qs = await getDocs(ref);
        return qs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
      }
    };

    const run = async () => {
      try {
        const uq = await safeGet('users', 'email');
        const users = uq as any as ExtUser[];
        const prodsDigital = await safeGet('products', 'name');
        const prodsFisicos = await safeGet('products-f', 'name');

        if (!active) return;
        setU(users);
        setPd(prodsDigital);
        setPf(prodsFisicos);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalUsers = u.length;

    const dTotal = pd.length;
    const dIn = pd.filter((x) => x.inStock !== false).length;

    const fTotal = pf.length;
    const fIn = pf.filter((x) => x.inStock !== false).length;

    const totalPoints = u.reduce((s, x) => s + (x.points || 0), 0);

    return { totalUsers, dTotal, dIn, fTotal, fIn, totalPoints };
  }, [u, pd, pf]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400/30 border-t-yellow-400 animate-spin" />
          <p className="text-slate-200 text-sm">Cargando panel…</p>
        </div>
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] px-4">
        <div className="max-w-sm w-full p-6 rounded-2xl border border-slate-700/60 bg-slate-900/70 text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] py-3 sm:py-4 px-2.5 sm:px-4">
      <div className="mx-auto w-full max-w-6xl">

        {/* Header compacto y responsive */}
        <div className="rounded-2xl border border-slate-700/60 overflow-hidden mb-3.5 sm:mb-5">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-400/90 to-yellow-400 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/15">
                <Shield size={18} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-xl font-extrabold text-black leading-tight truncate">
                  Panel de Administración
                </h1>
                <p className="text-black/70 text-xs sm:text-sm">Centro de control del sistema</p>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-slate-900/60">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <Stat label="Usuarios" value={stats.totalUsers} />
              <Stat label="Digitales" value={`${stats.dIn}/${stats.dTotal}`} />
              <Stat label="Físicos" value={`${stats.fIn}/${stats.fTotal}`} />
              <Stat label="Puntos totales" value={stats.totalPoints.toLocaleString()} />
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 mb-3.5 sm:mb-4">
          <Tile
            title="Gestión de Usuarios"
            desc="Administra usuarios, roles y puntos."
            icon={<Users size={20} />}
            onClick={() => navigate('/admin/users')}
          />
          <Tile
            title="Productos (Digital)"
            desc="Crea y edita productos del catálogo digital."
            icon={<Package size={20} />}
            onClick={() => navigate('/admin/products')}
          />
          <Tile
            title="Productos Físicos"
            desc="Inventario y catálogo de productos físicos."
            icon={<Package size={20} />}
            onClick={() => navigate('/admin/products-f')}
            badge="Nuevo"
          />
        </div>

        {/* Acciones secundarias */}
        <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-4">
          <Tile
            title="Recompensas"
            desc="Crear y administrar recompensas."
            icon={<BadgePercent size={20} />}
            onClick={() => navigate('/admin/coupons')}
          />
          <Tile
            title="Gestión de Colaboradores"
            desc="Permisos y miembros del equipo."
            icon={<Users size={20} />}
            onClick={() => navigate('/admin/colaborators')}
          />
        </div>

        {/* Footer sesión */}
        <div className="mt-4 sm:mt-5 rounded-xl border border-slate-700/60 bg-slate-900/60 p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-yellow-300 text-xs sm:text-sm">
              <Shield size={14} />
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

        <div className="mt-3 flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
          <Activity size={14} className="text-green-400" />
          <span>Última actualización al abrir el panel.</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
