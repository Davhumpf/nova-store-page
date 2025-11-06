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
  <div className="rounded-lg border border-[#D0D0D0] dark:border-gray-700 bg-[#F5F5F5] dark:bg-gray-800 p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none">
    <p className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light">{label}</p>
    <p className="text-base sm:text-lg font-bold text-[#4CAF50] dark:text-[#66FF7A] leading-tight mt-0.5">{value}</p>
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
    className={`group w-full text-left rounded-lg border p-3 transition-all ${
      disabled
        ? 'border-[#D0D0D0] dark:border-gray-700 bg-[#F5F5F5] dark:bg-gray-800 opacity-50 cursor-not-allowed'
        : 'border-[#D0D0D0] dark:border-gray-700 bg-[#F5F5F5] dark:bg-gray-800 hover:border-[#4CAF50] dark:hover:border-[#66FF7A] hover:shadow-[0_4px_16px_rgba(76,175,80,0.12)] dark:hover:shadow-none active:scale-[0.98]'
    }`}
  >
    <div className="flex items-start gap-2.5">
      <div className="p-1.5 rounded-md bg-[#E8E8E8] dark:bg-gray-700 text-[#2A2A2A] dark:text-white shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-[#2A2A2A] dark:text-white truncate">{title}</h3>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4CAF50]/15 dark:bg-[#66FF7A]/20 text-[#4CAF50] dark:text-[#66FF7A] font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-[#8A8A8A] dark:text-gray-400 font-light leading-tight">{desc}</p>
        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#8A8A8A] dark:text-gray-400">
          <span className="group-hover:text-[#4CAF50] dark:group-hover:text-[#66FF7A] transition-colors">Ir</span>
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  </button>
);

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [u, setU] = useState<ExtUser[]>([]);
  const [pd, setPd] = useState<Product[]>([]);
  const [pf, setPf] = useState<Product[]>([]);
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
      <div className="min-h-screen grid place-items-center bg-[#E8E8E8] dark:bg-gray-900">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full border-3 border-[#4CAF50]/30 dark:border-[#66FF7A]/30 border-t-[#4CAF50] dark:border-t-[#66FF7A] animate-spin" />
          <p className="text-[#5A5A5A] dark:text-gray-400 text-xs font-light">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#E8E8E8] dark:bg-gray-900 px-4">
        <div className="max-w-xs w-full p-5 rounded-lg border border-[#D0D0D0] dark:border-gray-700 bg-[#F5F5F5] dark:bg-gray-800 text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none">
          <div className="mx-auto w-10 h-10 rounded-full grid place-items-center bg-red-500/10 dark:bg-red-500/20 mb-2">
            <Lock className="text-red-500 dark:text-red-400" size={18} />
          </div>
          <h2 className="text-base font-semibold text-[#2A2A2A] dark:text-white mb-1">Acceso restringido</h2>
          <p className="text-[#8A8A8A] dark:text-gray-400 text-xs font-light">No tienes permisos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8] dark:bg-gray-900 py-3 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-5xl">

        {/* Botón volver estilo Apple - Superior izquierda */}
        <button
          onClick={() => navigate('/')}
          className="mb-3 flex items-center gap-1.5 text-xs text-[#4CAF50] dark:text-[#66FF7A] hover:text-[#45a049] dark:hover:text-[#4CAF50] transition-colors group"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Inicio</span>
        </button>

        {/* Header minimalista */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-8 bg-[#4CAF50] dark:bg-[#66FF7A] rounded-full shadow-sm"></div>
            <div>
              <h1 className="text-lg font-light text-[#2A2A2A] dark:text-white">Panel de Administración</h1>
              <p className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light">{user.email}</p>
            </div>
          </div>

          {/* Stats compactos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Usuarios" value={stats.totalUsers} />
            <Stat label="Digitales" value={`${stats.dIn}/${stats.dTotal}`} />
            <Stat label="Físicos" value={`${stats.fIn}/${stats.fTotal}`} />
            <Stat label="Puntos" value={stats.totalPoints.toLocaleString()} />
          </div>
        </div>

        {/* Grid de acciones */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
          <Tile
            title="Usuarios"
            desc="Administra usuarios y puntos"
            icon={<Users size={18} />}
            onClick={() => navigate('/admin/users')}
          />
          <Tile
            title="Productos Digital"
            desc="Catálogo digital"
            icon={<Package size={18} />}
            onClick={() => navigate('/admin/products')}
          />
          <Tile
            title="Productos Físicos"
            desc="Inventario físico"
            icon={<Package size={18} />}
            onClick={() => navigate('/admin/products-f')}
            badge="Nuevo"
          />
          <Tile
            title="Recompensas"
            desc="Crear recompensas"
            icon={<BadgePercent size={18} />}
            onClick={() => navigate('/admin/coupons')}
          />
          <Tile
            title="Colaboradores"
            desc="Gestión de equipo"
            icon={<Users size={18} />}
            onClick={() => navigate('/admin/colaborators')}
          />
        </div>

        {/* Footer minimalista */}
        <div className="flex items-center gap-1.5 mt-3 p-2.5 rounded-lg border border-[#D0D0D0] dark:border-gray-700 bg-[#F5F5F5] dark:bg-gray-800">
          <Activity size={12} className="text-[#4CAF50] dark:text-[#66FF7A]" />
          <span className="text-[10px] text-[#8A8A8A] dark:text-gray-400">Actualizado al cargar</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;