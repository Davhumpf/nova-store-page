// src/components/admin/ProductManagement.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  Edit,
  Trash2,
  Save,
  X,
  Plus,
  ArrowRight,
  Star,
} from 'lucide-react';

type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  planType: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  duration: string;
  devices: string;
  inStock: boolean;
};

const ADMIN_EMAILS = ['scpu.v1@gmail.com'];

const EMPTY: Omit<Product, 'id'> = {
  name: '',
  description: '',
  longDescription: '',
  category: 'video',
  planType: 'Mensual',
  price: 0,
  originalPrice: 0,
  discount: 0,
  rating: 0,
  reviews: 0,
  imageUrl: '',
  duration: '30 días',
  devices: 'Hasta 1 dispositivo',
  inStock: true,
};

const CATEGORIES = ['video', 'music', 'gaming', 'tools', 'education', 'productivity'];
const PLANS = ['Mensual', 'Anual', 'Trimestral', 'Único', 'Premium'];

const ProductManagement: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Product, 'id'>>({ ...EMPTY });

  useEffect(() => {
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const col = collection(db, 'products');
      let qs;
      try {
        qs = await getDocs(query(col, orderBy('name')));
      } catch (e) {
        console.warn('orderBy(name) falló; usando carga sin ordenar:', e);
        qs = await getDocs(col);
      }
      const arr: Product[] = [];
      qs.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
      setItems(arr);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar productos');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return items;
    return items.filter((x) => {
      const n = (x.name || '').toLowerCase();
      const c = (x.category || '').toLowerCase();
      const p = (x.planType || '').toLowerCase();
      return n.includes(t) || c.includes(t) || p.includes(t);
    });
  }, [items, search]);

  function openCreate() {
    setForm({ ...EMPTY });
    setCreating(true);
    setEditing(null);
  }

  function openEdit(p: Product) {
    const { id, ...rest } = p;
    setForm({ ...EMPTY, ...rest });
    setEditing(p);
    setCreating(false);
  }

  function closeModal() {
    setCreating(false);
    setEditing(null);
    setForm({ ...EMPTY });
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const col = collection(db, 'products');
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        originalPrice: Number(form.originalPrice) || 0,
        discount: Number(form.discount) || 0,
        rating: Number(form.rating) || 0,
        reviews: Number(form.reviews) || 0,
        inStock: typeof form.inStock === 'boolean' ? form.inStock : true,
      };

      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), payload as any);
      } else {
        await addDoc(col, payload as any);
      }

      closeModal();
      await load();
    } catch (err) {
      console.error('save error', err);
      alert('No se pudo guardar. Revisa la consola.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      await load();
    } catch (err) {
      console.error('delete error', err);
      alert('No se pudo eliminar.');
    }
  }

  const total = items.length;
  const inStockCount = items.filter((x) => x.inStock).length;

  return (
    <div className="min-h-screen bg-white dark:bg-black py-2 px-2 sm:py-3 sm:px-4">
      <div className="mx-auto w-full max-w-6xl">

        {/* Botón volver */}
        <button
          onClick={() => navigate('/admin')}
          className="mb-2 flex items-center gap-1 text-[10px] sm:text-xs text-accent-primary hover:text-accent-primary transition-colors group"
        >
          <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Panel Admin</span>
        </button>

        {/* Header compacto para móvil */}
        <div className="mb-2 sm:mb-4 bg-white dark:bg-black border-4 border-black dark:border-white shadow-classic-lg">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 p-3">
            <div className="w-0.5 sm:w-1 h-6 sm:h-8 bg-accent-primary rounded-full"></div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-[#2A2A2A] dark:text-white truncate title-shadow uppercase">Productos Digitales</h1>
              <p className="text-[9px] sm:text-[10px] text-[#8A8A8A] dark:text-gray-400 font-medium">Streaming y servicios</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="text-center">
                <p className="text-[8px] sm:text-[9px] text-[#8A8A8A] dark:text-gray-400">Stock</p>
                <p className="text-[11px] sm:text-sm font-bold text-accent-primary">{inStockCount}/{total}</p>
              </div>
              <button
                onClick={openCreate}
                className="border-4 border-black dark:border-white bg-white dark:bg-black text-accent-primary font-black uppercase px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs flex items-center gap-1 shadow-classic-md"
              >
                <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Nuevo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Buscador compacto */}
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-2 sm:p-3 mb-2 sm:mb-3 shadow-classic-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8A8A8A] dark:text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="classic-input w-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-2 sm:pr-3 text-[11px] sm:text-xs"
            />
          </div>
        </div>

        {/* Lista de productos - Optimizada para móvil */}
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white overflow-hidden shadow-classic-lg">
          <div className="p-2 sm:p-3 border-b-4 border-black dark:border-white bg-white dark:bg-black">
            <h2 className="text-[11px] sm:text-sm font-bold text-accent-primary uppercase flex items-center gap-1 sm:gap-1.5">
              <Package size={12} className="sm:w-3.5 sm:h-3.5" />
              Productos ({filtered.length})
            </h2>
          </div>

          <div className="p-2 sm:p-3">
            {loading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-1.5 sm:mb-2"></div>
                <p className="text-accent-primary font-bold text-[10px] sm:text-xs">Cargando...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Package className="mx-auto text-[#D0D0D0] dark:text-gray-600 mb-1.5 sm:mb-2" size={24} />
                <p className="text-[#8A8A8A] dark:text-gray-400 text-[10px] sm:text-xs font-light">
                  {search ? 'No hay resultados' : 'No hay productos'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-240px)] sm:max-h-[65vh] overflow-y-auto pr-0.5">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="border-4 border-black dark:border-white bg-white dark:bg-black p-2 sm:p-3 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,0.5)] transition-all shadow-classic-md"
                  >
                    <div className="flex gap-2 sm:gap-3">
                      {/* Imagen - más pequeña en móvil */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 border-black dark:border-white bg-white dark:bg-black shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} className="text-[#D0D0D0] dark:text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Info - compacta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[11px] sm:text-xs font-semibold text-[#2A2A2A] dark:text-white truncate leading-tight">{p.name}</h3>
                            <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 mt-0.5">
                              <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 bg-white dark:bg-black text-accent-primary font-bold uppercase border-2 border-black dark:border-white">
                                {p.category}
                              </span>
                              <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 bg-white dark:bg-black text-accent-primary font-bold uppercase border-2 border-black dark:border-white">
                                {p.planType}
                              </span>
                              {!p.inStock && (
                                <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 bg-white dark:bg-black text-accent-error font-bold uppercase border-2 border-black dark:border-white">
                                  Sin stock
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Precio */}
                          <div className="text-right shrink-0">
                            {p.discount > 0 && (
                              <div className="text-[8px] sm:text-[9px] text-red-500 dark:text-red-400 font-bold leading-tight">
                                -{p.discount}%
                              </div>
                            )}
                            <div className="text-accent-success font-bold text-xs sm:text-sm leading-tight title-shadow">
                              ${Number(p.price).toLocaleString('es-CO')}
                            </div>
                            {Number(p.originalPrice) > Number(p.price) && (
                              <div className="text-[8px] sm:text-[9px] text-[#8A8A8A] dark:text-gray-400 line-through leading-tight">
                                ${Number(p.originalPrice).toLocaleString('es-CO')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Descripción - oculta en pantallas muy pequeñas */}
                        <p className="hidden xs:block text-[9px] sm:text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light line-clamp-1 mb-1">
                          {p.description}
                        </p>

                        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <div className="text-[8px] sm:text-[9px] text-[#8A8A8A] dark:text-gray-400 font-light truncate">
                            {p.duration} · {p.devices}
                          </div>
                          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                            <Star size={9} className="sm:w-2.5 sm:h-2.5 text-[#FFD700] fill-[#FFD700]" />
                            <span className="text-[8px] sm:text-[9px] text-[#2A2A2A] dark:text-white font-medium">{p.rating}</span>
                            <span className="text-[8px] sm:text-[9px] text-[#8A8A8A] dark:text-gray-400">({p.reviews})</span>
                          </div>
                        </div>

                        {/* Botones compactos */}
                        <div className="flex gap-1 sm:gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex-1 inline-flex items-center justify-center gap-0.5 sm:gap-1 px-1.5 py-1 sm:px-2 sm:py-1.5 border-2 border-black dark:border-white bg-white dark:bg-black text-accent-primary font-bold text-[9px] sm:text-[10px] uppercase hover:shadow-classic-sm dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] transition-all"
                          >
                            <Edit size={10} className="sm:w-3 sm:h-3" />
                            <span className="hidden xs:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="flex-1 inline-flex items-center justify-center gap-0.5 sm:gap-1 px-1.5 py-1 sm:px-2 sm:py-1.5 border-2 border-black dark:border-white bg-white dark:bg-black text-accent-error font-bold text-[9px] sm:text-[10px] uppercase hover:shadow-classic-sm dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] transition-all"
                          >
                            <Trash2 size={10} className="sm:w-3 sm:h-3" />
                            <span className="hidden xs:inline">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal - Optimizado para móvil con scroll interno */}
        {(creating || editing) && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_rgba(0,0,0,0.8)] dark:shadow-[12px_12px_0px_rgba(255,255,255,0.5)] animate-scale-in w-full sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[95vh] flex flex-col">
              {/* Header fijo */}
              <div className="p-2.5 sm:p-3 border-b-4 border-black dark:border-white flex items-center justify-between shrink-0 bg-white dark:bg-black">
                <h3 className="text-xs sm:text-sm font-bold text-accent-primary uppercase flex items-center gap-1 sm:gap-1.5">
                  <Package size={12} className="sm:w-3.5 sm:h-3.5" />
                  {editing ? 'Editar' : 'Nuevo'}
                </h3>
                <button onClick={closeModal} className="p-1 sm:p-1.5 hover:shadow-classic-sm dark:hover:shadow-[2px_2px_0px_rgba(255,255,255,0.5)] transition-all">
                  <X size={14} className="sm:w-4 sm:h-4 text-[#8A8A8A] dark:text-gray-400" />
                </button>
              </div>

              {/* Formulario con scroll */}
              <form onSubmit={onSave} className="flex-1 overflow-y-auto">
                <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                  {/* Campos en una sola columna para móvil */}
                  <div>
                    <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light mb-0.5 sm:mb-1">Nombre</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                      className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                      placeholder="Ej: Netflix Premium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light mb-0.5 sm:mb-1">Descripción corta</label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                      className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light mb-0.5 sm:mb-1">Descripción larga</label>
                    <textarea
                      value={form.longDescription}
                      onChange={(e) => setForm((s) => ({ ...s, longDescription: e.target.value }))}
                      className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs h-16 sm:h-20 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Categoría</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                        className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                        required
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Plan</label>
                      <select
                        value={form.planType}
                        onChange={(e) => setForm((s) => ({ ...s, planType: e.target.value }))}
                        className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                        required
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Original</label>
                      <input
                        type="number"
                        value={Number(form.originalPrice)}
                        onChange={(e) => setForm((s) => ({ ...s, originalPrice: Number(e.target.value) }))}
                        className="classic-input w-full px-1.5 py-1.5 sm:px-2 sm:py-2 text-[11px] sm:text-xs"
                        min={0}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Precio</label>
                      <input
                        type="number"
                        value={Number(form.price)}
                        onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
                        className="classic-input w-full px-1.5 py-1.5 sm:px-2 sm:py-2 text-[11px] sm:text-xs"
                        min={0}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Desc %</label>
                      <input
                        type="number"
                        value={Number(form.discount)}
                        onChange={(e) => setForm((s) => ({ ...s, discount: Number(e.target.value) }))}
                        className="classic-input w-full px-1.5 py-1.5 sm:px-2 sm:py-2 text-[11px] sm:text-xs"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        max={5}
                        value={Number(form.rating)}
                        onChange={(e) => setForm((s) => ({ ...s, rating: Number(e.target.value) }))}
                        className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Reviews</label>
                      <input
                        type="number"
                        min={0}
                        value={Number(form.reviews)}
                        onChange={(e) => setForm((s) => ({ ...s, reviews: Number(e.target.value) }))}
                        className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Duración</label>
                      <input
                        value={form.duration}
                        onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))}
                        className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">Dispositivos</label>
                      <input
                        value={form.devices}
                        onChange={(e) => setForm((s) => ({ ...s, devices: e.target.value }))}
                        className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] font-light mb-0.5 sm:mb-1">URL imagen</label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
                      className="classic-input w-full px-2 py-1.5 sm:px-2.5 sm:py-2 text-[11px] sm:text-xs"
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-white dark:bg-black border-2 border-black dark:border-white">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={!!form.inStock}
                      onChange={(e) => setForm((s) => ({ ...s, inStock: e.target.checked }))}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-primary bg-white dark:bg-black border-2 border-black dark:border-white"
                    />
                    <label htmlFor="inStock" className="text-[10px] sm:text-xs text-[#2A2A2A] dark:text-white font-medium">
                      En stock
                    </label>
                  </div>

                  {form.imageUrl && (
                    <div>
                      <label className="block text-[9px] sm:text-[10px] text-[#8A8A8A] dark:text-gray-400 font-light mb-0.5 sm:mb-1">Vista previa</label>
                      <div className="w-full h-24 sm:h-32 border-2 border-black dark:border-white bg-white dark:bg-black overflow-hidden">
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones fijos en la parte inferior */}
                <div className="p-2.5 sm:p-3 border-t-4 border-black dark:border-white bg-white dark:bg-black shrink-0">
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-1.5 border-4 border-black dark:border-white bg-white dark:bg-black text-accent-success font-black uppercase px-3 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-xs disabled:opacity-50 shadow-classic-md"
                    >
                      {saving ? (
                        <>
                          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={12} className="sm:w-3.5 sm:h-3.5" />
                          Guardar
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-1.5 border-4 border-black dark:border-white bg-white dark:bg-black text-accent-error font-black uppercase px-3 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-xs shadow-classic-md"
                    >
                      <X size={12} className="sm:w-3.5 sm:h-3.5" />
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;