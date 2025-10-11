// src/components/admin/ProductManagementF.tsx
import React, { useEffect, useState, useMemo } from 'react';
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
  Image as ImageIcon,
  Film,
} from 'lucide-react';

type FProduct = {
  id: string;
  category?: string;
  description?: string;
  discount?: number;
  imageUrl?: string;
  media?: string[];
  inStock?: boolean;
  longDescription?: string;
  name: string;
  originalPrice?: number;
  price?: number;
  rating?: number;
  reviews?: number;
  shippingInfo?: string;
  sku?: string;
  stockQuantity?: number;
};

const ADMIN_EMAILS = ['scpu.v1@gmail.com'];

const EMPTY: Omit<FProduct, 'id' | 'name'> & { name: string } = {
  category: 'Tecnología',
  description: '',
  discount: 0,
  imageUrl: '',
  media: [],
  inStock: true,
  longDescription: '',
  name: '',
  originalPrice: 0,
  price: 0,
  rating: 0,
  reviews: 0,
  shippingInfo: '',
  sku: '',
  stockQuantity: 0,
};

const isVideo = (url?: string) =>
  !!url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

const firstMediaUrl = (p: FProduct): string | undefined => {
  if (p.media && p.media.length > 0) return p.media[0];
  return p.imageUrl;
};

const ProductManagementF: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [items, setItems] = useState<FProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<FProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<FProduct, 'id'>>({ ...EMPTY });

  useEffect(() => {
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const col = collection(db, 'products-f');
      let qs;
      try {
        qs = await getDocs(query(col, orderBy('name')));
      } catch (e) {
        console.warn('orderBy(name) falló; usando carga sin ordenar:', e);
        qs = await getDocs(col);
      }
      const arr: FProduct[] = [];
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
      const name = (x.name || '').toLowerCase();
      const cat = (x.category || '').toLowerCase();
      const sku = (x.sku || '').toLowerCase();
      return name.includes(t) || cat.includes(t) || sku.includes(t);
    });
  }, [items, search]);

  function openCreate() {
    setForm({ ...EMPTY });
    setCreating(true);
    setEditing(null);
  }

  function openEdit(p: FProduct) {
    const { id, ...rest } = p;
    const merged: Omit<FProduct, 'id'> = {
      ...EMPTY,
      ...rest,
      name: rest.name ?? '',
      media:
        (rest.media && rest.media.length > 0)
          ? rest.media
          : (rest.imageUrl ? [rest.imageUrl] : []),
    };
    setForm(merged);
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
      const col = collection(db, 'products-f');
      const normalizedMedia = (form.media ?? []).filter(Boolean);
      const mediaFinal =
        normalizedMedia.length > 0
          ? normalizedMedia
          : (form.imageUrl ? [form.imageUrl] : []);

      const payload: Omit<FProduct, 'id'> = {
        ...form,
        media: mediaFinal,
        discount: Number(form.discount) || 0,
        originalPrice: Number(form.originalPrice) || 0,
        price: Number(form.price) || 0,
        rating: Number(form.rating) || 0,
        reviews: Number(form.reviews) || 0,
        stockQuantity: Number(form.stockQuantity) || 0,
        inStock:
          (Number(form.stockQuantity) || 0) > 0
            ? true
            : typeof form.inStock === 'boolean'
            ? form.inStock
            : true,
      };

      if (payload.media && payload.media.length > 0) {
        payload.imageUrl = payload.media[0];
      }

      if (editing) {
        await updateDoc(doc(db, 'products-f', editing.id), payload as any);
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
    if (!confirm('¿Eliminar este producto físico?')) return;
    try {
      await deleteDoc(doc(db, 'products-f', id));
      await load();
    } catch (err) {
      console.error('delete error', err);
      alert('No se pudo eliminar.');
    }
  }

  const total = items.length;
  const inStockCount = items.filter((x) => x.inStock).length;

  return (
    <div className="min-h-screen bg-[#E8E8E8] py-3 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-6xl">
        
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
              <h1 className="text-lg font-light text-[#2A2A2A]">Productos Físicos</h1>
              <p className="text-[10px] text-[#8A8A8A] font-light">Inventario y gestión de stock</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-[9px] text-[#8A8A8A]">En stock</p>
                <p className="text-sm font-bold text-[#BA68C8]">{inStockCount}/{total}</p>
              </div>
              <button
                onClick={openCreate}
                className="bg-[#BA68C8] hover:bg-[#9C27B0] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(186,104,200,0.25)]"
              >
                <Plus size={14} />
                Nuevo
              </button>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-[#F5F5F5] rounded-lg border border-[#D0D0D0] p-3 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#8A8A8A]" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#D0D0D0] rounded-md py-2 pl-10 pr-3 text-xs text-[#2A2A2A] placeholder-[#8A8A8A] focus:border-[#BA68C8] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-[#F5F5F5] rounded-lg border border-[#D0D0D0] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="p-3 border-b border-[#D0D0D0]">
            <h2 className="text-sm font-medium text-[#2A2A2A] flex items-center gap-1.5">
              <Package size={14} />
              Productos ({filtered.length})
            </h2>
          </div>

          <div className="p-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-[#BA68C8]/30 border-t-[#BA68C8] rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[#8A8A8A] text-xs font-light">Cargando productos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto text-[#D0D0D0] mb-2" size={32} />
                <p className="text-[#8A8A8A] text-xs font-light">
                  {search ? 'No hay productos que coincidan' : 'No hay productos creados'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2 max-h-[65vh] overflow-y-auto pr-1">
                {filtered.map((p) => {
                  const cover = firstMediaUrl(p);
                  return (
                    <div
                      key={p.id}
                      className="rounded-md border border-[#D0D0D0] bg-white p-3 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-shadow"
                    >
                      <div className="flex gap-3">
                        {/* Imagen/Video */}
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-[#D0D0D0] bg-[#F5F5F5] shrink-0 relative">
                          {cover ? (
                            isVideo(cover) ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="text-[#8A8A8A]" size={20} />
                              </div>
                            ) : (
                              <img src={cover} alt={p.name} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="text-[#D0D0D0]" size={20} />
                            </div>
                          )}
                          {(p.media?.length ?? 0) > 1 && (
                            <span className="absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-[#BA68C8] text-white font-medium">
                              {p.media!.length}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs font-semibold text-[#2A2A2A] truncate">{p.name}</h3>
                              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#BA68C8]/10 text-[#BA68C8] font-medium">
                                  {p.category || 'Sin categoría'}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-[#8A8A8A] font-medium">
                                  SKU: {p.sku || 'N/A'}
                                </span>
                                {!p.inStock && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-medium">
                                    Sin stock
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Precio */}
                            <div className="text-right shrink-0">
                              {p.discount && p.discount > 0 && (
                                <div className="text-[9px] text-red-500 font-bold">
                                  -{p.discount}%
                                </div>
                              )}
                              <div className="text-[#BA68C8] font-bold text-sm leading-tight">
                                ${Number(p.price || 0).toLocaleString('es-CO')}
                              </div>
                              {Number(p.originalPrice || 0) > Number(p.price || 0) && (
                                <div className="text-[9px] text-[#8A8A8A] line-through">
                                  ${Number(p.originalPrice || 0).toLocaleString('es-CO')}
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-[10px] text-[#8A8A8A] font-light line-clamp-1 mb-1">
                            {p.description || 'Sin descripción'}
                          </p>

                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="text-[9px] font-light">
                              <span className={`px-2 py-0.5 rounded ${
                                p.inStock 
                                  ? 'bg-green-500/10 text-green-600' 
                                  : 'bg-red-500/10 text-red-500'
                              }`}>
                                Stock: {p.stockQuantity ?? 0}
                              </span>
                            </div>
                            {p.rating && p.rating > 0 && (
                              <div className="text-[9px] text-[#8A8A8A]">
                                ⭐ {p.rating} ({p.reviews || 0})
                              </div>
                            )}
                          </div>

                          {/* Botones de acción */}
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => openEdit(p)}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border border-[#D0D0D0] hover:border-[#BA68C8] hover:bg-[#BA68C8]/5 text-[#2A2A2A] text-[10px] font-medium transition-colors"
                            >
                              <Edit size={12} />
                              Editar
                            </button>
                            <button
                              onClick={() => onDelete(p.id)}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 text-[10px] font-medium transition-colors"
                            >
                              <Trash2 size={12} />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Crear/Editar */}
        {(creating || editing) && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-3">
            <div className="bg-[#F5F5F5] rounded-lg border border-[#D0D0D0] w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              {/* Header del modal */}
              <div className="p-3 border-b border-[#D0D0D0] flex items-center justify-between sticky top-0 bg-[#F5F5F5] z-10">
                <h3 className="text-sm font-medium text-[#2A2A2A] flex items-center gap-1.5">
                  <Package size={14} className="text-[#BA68C8]" />
                  {editing ? 'Editar producto físico' : 'Nuevo producto físico'}
                </h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-[#E8E8E8] rounded-md transition-colors">
                  <X size={16} className="text-[#8A8A8A]" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={onSave} className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Columna izquierda */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Nombre del producto</label>
                      <input
                        value={form.name || ''}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                        placeholder="Ej: Auriculares Bluetooth"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Descripción corta</label>
                      <input
                        value={form.description || ''}
                        onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                        className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                        placeholder="Descripción breve"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Descripción larga</label>
                      <textarea
                        value={form.longDescription || ''}
                        onChange={(e) => setForm((s) => ({ ...s, longDescription: e.target.value }))}
                        className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors h-24 resize-none"
                        placeholder="Descripción detallada del producto"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Categoría</label>
                        <input
                          value={form.category || ''}
                          onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                          placeholder="Tecnología"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">SKU</label>
                        <input
                          value={form.sku || ''}
                          onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value.toUpperCase() }))}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors font-mono"
                          placeholder="AUR-BT-001"
                        />
                      </div>
                    </div>

                    {/* Campo de Media (múltiples URLs) */}
                    <div>
                      <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">
                        Media (imágenes/videos)
                      </label>
                      <textarea
                        value={(form.media && form.media.length > 0) ? form.media.join('\n') : (form.imageUrl || '')}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            media: e.target.value
                              .split(/\r?\n|,/)
                              .map((u) => u.trim())
                              .filter(Boolean),
                          }))
                        }
                        className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors h-24 resize-y font-mono"
                        placeholder="https://ejemplo.com/img1.jpg&#10;https://ejemplo.com/video.mp4"
                      />
                      <p className="text-[9px] text-[#8A8A8A] mt-1">
                        Un link por línea. Soporta .jpg, .png, .webp, .mp4, .webm
                      </p>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Precio original</label>
                        <input
                          type="number"
                          value={Number(form.originalPrice || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, originalPrice: Number(e.target.value) }))}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Precio final</label>
                        <input
                          type="number"
                          value={Number(form.price || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Descuento %</label>
                        <input
                          type="number"
                          value={Number(form.discount || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, discount: Number(e.target.value) }))}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Rating (0-5)</label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={5}
                          value={Number(form.rating || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, rating: Number(e.target.value) }))}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Número de reviews</label>
                        <input
                          type="number"
                          min={0}
                          value={Number(form.reviews || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, reviews: Number(e.target.value) }))}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Cantidad en stock</label>
                        <input
                          type="number"
                          min={0}
                          value={Number(form.stockQuantity || 0)}
                          onChange={(e) => {
                            const v = Math.max(0, Number(e.target.value));
                            setForm((s) => ({ ...s, stockQuantity: v, inStock: v > 0 }));
                          }}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">¿En stock?</label>
                        <select
                          value={(form.inStock ? '1' : '0') as string}
                          onChange={(e) => setForm((s) => ({ ...s, inStock: e.target.value === '1' }))}
                          className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                        >
                          <option value="1">Sí</option>
                          <option value="0">No</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Información de envío</label>
                      <input
                        value={form.shippingInfo || ''}
                        onChange={(e) => setForm((s) => ({ ...s, shippingInfo: e.target.value }))}
                        className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-2 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                        placeholder="Envío nacional 3-5 días hábiles"
                      />
                    </div>

                    {/* Vista previa de media */}
                    <div>
                      <label className="block text-[10px] text-[#8A8A8A] font-light mb-1">Vista previa</label>
                      {form.media && form.media.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {form.media.slice(0, 6).map((m, i) => (
                            <div 
                              key={i} 
                              className="relative rounded-md overflow-hidden border border-[#D0D0D0] bg-[#F5F5F5] aspect-square flex items-center justify-center"
                            >
                              {isVideo(m) ? (
                                <Film className="text-[#8A8A8A]" size={18} />
                              ) : (
                                <img 
                                  src={m} 
                                  alt={`media-${i}`} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-[#BA68C8] text-white font-medium">
                                {i + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-24 rounded-md border border-[#D0D0D0] bg-white flex items-center justify-center">
                          <p className="text-[#8A8A8A] text-xs">Sin media aún</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones del formulario */}
                <div className="pt-3 border-t border-[#D0D0D0] flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#BA68C8] hover:bg-[#9C27B0] text-white px-4 py-2.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 shadow-[0_2px_8px_rgba(186,104,200,0.25)]"
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Guardar producto
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-[#D0D0D0] text-[#2A2A2A] px-4 py-2.5 rounded-md text-xs font-medium hover:bg-[#E8E8E8] transition-colors"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagementF;