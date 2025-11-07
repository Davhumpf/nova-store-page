// src/components/admin/CouponsManagement.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
} from 'lucide-react';

type Reward = {
  id: string;
  title: string;
  costPoints: number;
  type: 'percent' | 'fixed';
  value: number;
  active: boolean;
  expiresAt?: Timestamp | null;
  createdAt: Timestamp;
};

const CouponsManagement: React.FC = () => {
  const nav = useNavigate();
  const [items, setItems] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [costPoints, setCostPoints] = useState<number>(100);
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState<number>(10);
  const [expires, setExpires] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const col = collection(db, 'rewards');
      const qs = await getDocs(query(col, orderBy('createdAt', 'desc')));
      const arr: Reward[] = [];
      qs.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
      setItems(arr);
    } catch (error) {
      console.error('Error loading rewards:', error);
      alert('Error al cargar recompensas');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Título requerido');
    if (costPoints <= 0) return alert('Puntos inválidos');
    if (type === 'percent' && (value <= 0 || value > 90))
      return alert('Porcentaje 1–90');
    if (type === 'fixed' && value <= 0) return alert('Monto > 0');

    try {
      const col = collection(db, 'rewards');
      await addDoc(col, {
        title: title.trim(),
        costPoints,
        type,
        value,
        active: true,
        expiresAt: expires ? Timestamp.fromDate(new Date(expires)) : null,
        createdAt: Timestamp.now(),
      });
      setTitle('');
      setCostPoints(100);
      setType('percent');
      setValue(10);
      setExpires('');
      await load();
    } catch (error) {
      console.error('Error creating reward:', error);
      alert('Error al crear recompensa');
    }
  };

  const toggle = async (id: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'rewards', id), { active: !active });
      await load();
    } catch (error) {
      console.error('Error toggling reward:', error);
      alert('Error al cambiar estado');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar recompensa?')) return;
    try {
      await deleteDoc(doc(db, 'rewards', id));
      await load();
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('Error al eliminar recompensa');
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8] dark:bg-gray-900 py-3 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-5xl">

        {/* Botón volver estilo Apple */}
        <button
          onClick={() => nav('/admin')}
          className="mb-3 flex items-center gap-1.5 text-xs text-[#BA68C8] dark:text-[#CE93D8] hover:text-[#9C27B0] dark:hover:text-[#BA68C8] transition-colors group"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Panel Admin</span>
        </button>

        {/* Header minimalista */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-8 bg-[#BA68C8] dark:bg-[#CE93D8] rounded-full shadow-sm"></div>
            <div className="flex-1">
              <h1 className="text-lg font-light text-[#2A2A2A] dark:text-white">Canjes por Puntos</h1>
              <p className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light">Crear y administrar recompensas</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-[#8A8A8A] dark:text-gray-400">Total</p>
              <p className="text-sm font-bold text-[#BA68C8] dark:text-[#CE93D8]">{items.length}</p>
            </div>
          </div>
        </div>

        {/* Formulario de creación */}
        <div className="bg-[#F5F5F5] dark:bg-gray-800 rounded-lg border border-[#D0D0D0] dark:border-gray-700 p-3 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none">
          <h2 className="text-xs font-medium text-[#2A2A2A] dark:text-white mb-2.5 flex items-center gap-1.5">
            <Plus size={12} />
            Nueva Recompensa
          </h2>
          <form onSubmit={create} className="grid gap-2 lg:grid-cols-12 lg:items-end">
            {/* Título */}
            <div className="lg:col-span-3">
              <label className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light block mb-1">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: 10% OFF en total"
                className="w-full bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs text-[#2A2A2A] dark:text-white placeholder-[#8A8A8A] dark:placeholder-gray-400 focus:border-[#BA68C8] dark:focus:border-[#CE93D8] focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Costo en puntos */}
            <div className="lg:col-span-2">
              <label className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light block mb-1">Puntos</label>
              <input
                type="number"
                value={costPoints}
                onChange={(e) => setCostPoints(Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs text-[#2A2A2A] dark:text-white focus:border-[#BA68C8] dark:focus:border-[#CE93D8] focus:outline-none transition-colors"
                min={1}
                required
              />
            </div>

            {/* Tipo */}
            <div className="lg:col-span-2">
              <label className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light block mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs text-[#2A2A2A] dark:text-white focus:border-[#BA68C8] dark:focus:border-[#CE93D8] focus:outline-none transition-colors"
              >
                <option value="percent">% Porcentaje</option>
                <option value="fixed">$ Fijo</option>
              </select>
            </div>

            {/* Valor */}
            <div className="lg:col-span-1">
              <label className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light block mb-1">
                {type === 'percent' ? '%' : '$'}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs text-[#2A2A2A] dark:text-white focus:border-[#BA68C8] dark:focus:border-[#CE93D8] focus:outline-none transition-colors"
                min={1}
                max={type === 'percent' ? 90 : undefined}
                required
              />
            </div>

            {/* Expira */}
            <div className="lg:col-span-2">
              <label className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light block mb-1">Expira (opcional)</label>
              <input
                type="date"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs text-[#2A2A2A] dark:text-white focus:border-[#BA68C8] dark:focus:border-[#CE93D8] focus:outline-none transition-colors"
              />
            </div>

            {/* Botón crear */}
            <button
              type="submit"
              className="lg:col-span-2 bg-[#BA68C8] dark:bg-[#CE93D8] hover:bg-[#9C27B0] dark:hover:bg-[#BA68C8] text-white dark:text-gray-900 px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(186,104,200,0.25)] dark:shadow-none"
            >
              <Plus size={14} />
              Crear
            </button>
          </form>
        </div>

        {/* Lista de recompensas */}
        <div className="bg-[#F5F5F5] dark:bg-gray-800 rounded-lg border border-[#D0D0D0] dark:border-gray-700 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none">
          <div className="p-3 border-b border-[#D0D0D0] dark:border-gray-700">
            <h2 className="text-sm font-medium text-[#2A2A2A] dark:text-white flex items-center gap-1.5">
              <Gift size={14} />
              Recompensas Activas
            </h2>
          </div>

          <div className="p-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-[#BA68C8]/30 dark:border-[#CE93D8]/30 border-t-[#BA68C8] dark:border-t-[#CE93D8] rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[#8A8A8A] dark:text-gray-400 text-xs font-light">Cargando...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="mx-auto text-[#D0D0D0] dark:text-gray-600 mb-2" size={32} />
                <p className="text-[#8A8A8A] dark:text-gray-400 text-xs font-light">No hay recompensas creadas</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {items.map((r) => {
                  const exp = r.expiresAt
                    ? new Date(r.expiresAt.seconds * 1000).toLocaleDateString()
                    : 'Sin expiración';
                  return (
                    <div
                      key={r.id}
                      className="rounded-md border border-[#D0D0D0] dark:border-gray-700 bg-white dark:bg-gray-700 p-3 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:hover:shadow-none transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-xs text-[#2A2A2A] dark:text-white font-semibold truncate">
                              {r.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#BA68C8]/10 dark:bg-[#CE93D8]/20 text-[#BA68C8] dark:text-[#CE93D8] font-medium">
                              {r.type === 'percent' ? `${r.value}%` : `$${r.value}`}
                            </span>
                            {!r.active && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400 font-medium">
                                Inactiva
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light">
                            Costo: <span className="font-medium text-[#BA68C8] dark:text-[#CE93D8]">{r.costPoints} pts</span> · Expira: {exp}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggle(r.id, r.active)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#D0D0D0] dark:border-gray-600 hover:border-[#BA68C8] dark:hover:border-[#CE93D8] hover:bg-[#BA68C8]/5 dark:hover:bg-[#CE93D8]/10 transition-colors"
                            title={r.active ? 'Desactivar' : 'Activar'}
                          >
                            {r.active ? (
                              <ToggleRight size={16} className="text-[#4CAF50] dark:text-[#66FF7A]" />
                            ) : (
                              <ToggleLeft size={16} className="text-[#8A8A8A] dark:text-gray-400" />
                            )}
                            <span className="text-[10px] text-[#2A2A2A] dark:text-white font-medium hidden xs:inline">
                              {r.active ? 'Activa' : 'Inactiva'}
                            </span>
                          </button>
                          <button
                            onClick={() => remove(r.id)}
                            className="p-1.5 rounded-md border border-red-500/30 dark:border-red-500/40 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponsManagement;