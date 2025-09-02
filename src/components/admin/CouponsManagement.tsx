// src/components/admin/CouponsManagement.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
  ArrowLeft,
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

  const col = useMemo(() => collection(db, 'rewards'), []);

  const load = async () => {
    setLoading(true);
    const qs = await getDocs(query(col, orderBy('createdAt', 'desc')));
    const arr: Reward[] = [];
    qs.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
    setItems(arr);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Título requerido');
    if (costPoints <= 0) return alert('Puntos inválidos');
    if (type === 'percent' && (value <= 0 || value > 90))
      return alert('Porcentaje 1–90');
    if (type === 'fixed' && value <= 0) return alert('Monto > 0');

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
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await updateDoc(doc(db, 'rewards', id), { active: !active });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Eliminar recompensa?')) return;
    await deleteDoc(doc(db, 'rewards', id));
    load();
  };

  return (
    <div className="min-h-screen bg-slate-900 py-4 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-4xl">
        <button
          onClick={() => nav('/admin')}
          className="mb-3 inline-flex items-center gap-2 text-yellow-400"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="rounded-2xl border border-slate-700/60 overflow-hidden mb-5">
          <div className="bg-yellow-400/90 px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/15">
              <Gift size={22} className="text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-black">
                Canjes por Puntos
              </h1>
              <p className="text-black/70 text-xs sm:text-sm">
                Crea recompensas canjeables
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60">
            <form
              onSubmit={create}
              className="grid sm:grid-cols-5 gap-3 items-end"
            >
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400">Título</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="10% OFF en total"
                  className="w-full mt-1 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Costo en puntos</label>
                <input
                  type="number"
                  value={costPoints}
                  onChange={(e) => setCostPoints(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full mt-1 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="percent">% Porcentaje</option>
                  <option value="fixed">$ Fijo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  {type === 'percent' ? 'Porcentaje %' : 'Monto $'}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  min={1}
                  max={type === 'percent' ? 90 : undefined}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400">Expira (opcional)</label>
                <input
                  type="date"
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                  className="w-full mt-1 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300"
              >
                <Plus size={16} /> Crear
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 sm:p-4">
          {loading ? (
            <p className="text-slate-400 text-sm">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="text-slate-400 text-sm">No hay recompensas.</p>
          ) : (
            <div className="grid gap-3">
              {items.map((r) => {
                const exp = r.expiresAt
                  ? new Date(r.expiresAt.seconds * 1000).toLocaleDateString()
                  : '—';
                return (
                  <div
                    key={r.id}
                    className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">
                          {r.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {r.type === 'percent' ? `${r.value}%` : `$${r.value}`}
                        </span>
                        {!r.active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                            inactiva
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Costo: {r.costPoints} pts · Expira: {exp}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(r.id, r.active)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-700 hover:border-yellow-400/40"
                        title={r.active ? 'Desactivar' : 'Activar'}
                      >
                        {r.active ? (
                          <ToggleRight
                            size={18}
                            className="text-green-400"
                          />
                        ) : (
                          <ToggleLeft size={18} className="text-slate-400" />
                        )}
                        <span className="text-sm text-slate-200">
                          {r.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-red-600/40 text-red-400 hover:bg-red-500/10"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsManagement;
