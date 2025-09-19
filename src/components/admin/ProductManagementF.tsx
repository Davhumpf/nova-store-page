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
  Loader,
  ArrowLeft,
  Shield,
  Image as ImageIcon,
  Film,
} from 'lucide-react';

/** ─────────────────────────────────────────────────────────────
 *  TIPOS
 *  Ahora soporta media: string[] (imágenes o videos por URL).
 *  Dejamos imageUrl opcional para compatibilidad.
 *  ──────────────────────────────────────────────────────────── */
type FProduct = {
  id: string;
  category?: string;
  description?: string;
  discount?: number;
  imageUrl?: string;     // compat (fallback)
  media?: string[];      // NUEVO: varias imágenes/videos
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
  imageUrl: '',      // compat
  media: [],         // NUEVO
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

/** Helpers */
const isVideo = (url?: string) =>
  !!url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

const firstMediaUrl = (p: FProduct): string | undefined => {
  // Prioriza media[0]. Si no hay, usa imageUrl
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

  // seguridad
  useEffect(() => {
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // colección correcta (según tu Firestore)
  const col = useMemo(() => collection(db, 'products-f'), []);

  // carga con fallback
  const load = async () => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Normaliza: si no hay media pero sí imageUrl, precarga media=[imageUrl]
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
      // Normaliza media: si está vacío pero hay imageUrl, úsalo
      const normalizedMedia =
        (form.media ?? []).filter(Boolean);
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

      // Limpia imageUrl si ya hay media (opcional):
      if (payload.media && payload.media.length > 0) {
        // mantenemos imageUrl como primer media para compatibilidad visual
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

  const Header = (
    <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 mb-4 sm:mb-6">
      <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 sm:p-2.5 bg-[#FFD600]/10 hover:bg-[#FFD600]/20 rounded-lg shrink-0"
            title="Volver"
          >
            <ArrowLeft size={18} className="text-[#FFD600]" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-r from-[#FFD600] to-[#FFC400] rounded-lg shrink-0">
              <Package className="text-black" size={18} />
            </div>
            <h1 className="text-base sm:text-xl font-bold text-white truncate">
              Productos Físicos
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#FFD600]/15 px-2.5 py-1 rounded-full">
            <Shield size={14} className="text-[#FFD600]" />
            <span className="text-[#FFD600] text-xs sm:text-sm font-semibold">
              {items.filter((x) => x.inStock).length}/{items.length}
            </span>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#FFD600] to-[#FFC400] text-black font-bold px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#FFD600]/25"
          >
            <Plus size={16} />
            <span className="text-sm sm:text-base">Nuevo</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] py-4 px-3 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        {Header}

        {/* Buscador */}
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl border border-gray-700/50 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700/50 rounded-xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 text-[15px] sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center py-14 sm:py-16">
              <div className="flex items-center gap-3 text-[#FFD600]">
                <Loader size={22} className="animate-spin" />
                <span className="font-semibold">Cargando productos…</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 py-14 sm:py-16">
              No hay productos que coincidan.
            </div>
          ) : (
            filtered.map((p) => {
              const cover = firstMediaUrl(p);
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-gray-700/50 bg-[#1a1a1a]/70 p-3 sm:p-4 flex gap-3 sm:gap-4"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-700/50 bg-[#2a2a2a] shrink-0 relative">
                    {cover ? (
                      isVideo(cover) ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/30">
                          <Film className="text-white/80" />
                        </div>
                      ) : (
                        <img src={cover} alt={p.name} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-gray-500" />
                      </div>
                    )}
                    {/* Badge cantidad de media */}
                    {(p.media?.length ?? 0) > 1 && (
                      <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                        {p.media!.length}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-white font-bold leading-tight truncate">{p.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">
                          {(p.category || '—')} • SKU {(p.sku || '—')}
                        </p>
                        <p className="hidden sm:block text-xs text-gray-500 mt-1 line-clamp-2">
                          {p.description || ''}
                        </p>
                      </div>
                      <div className="text-right">
                        {p.discount && p.discount > 0 && (
                          <div className="text-[11px] sm:text-xs text-red-400 font-bold">
                            -{p.discount}%
                          </div>
                        )}
                        <div className="text-[#FFD600] font-extrabold leading-tight">
                          ${Number(p.price || 0).toLocaleString('es-CO')}
                        </div>
                        {Number(p.originalPrice || 0) > Number(p.price || 0) && (
                          <div className="text-[11px] sm:text-xs text-gray-500 line-through">
                            ${Number(p.originalPrice || 0).toLocaleString('es-CO')}
                          </div>
                        )}
                        <div className="mt-1 text-[11px] sm:text-xs">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              p.inStock ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            {p.inStock ? `Stock ${p.stockQuantity ?? 0}` : 'Sin stock'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-white text-xs sm:text-sm"
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs sm:text-sm"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Crear/Editar */}
        {(creating || editing) && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <div className="p-4 sm:p-5 border-b border-gray-700/50 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Package size={18} className="text-[#FFD600]" />
                  {editing ? 'Editar producto físico' : 'Nuevo producto físico'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-700/40 rounded-lg">
                  <X size={18} className="text-gray-300" />
                </button>
              </div>

              <form onSubmit={onSave} className="p-4 sm:p-5 space-y-6">
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Nombre</label>
                      <input
                        value={form.name || ''}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        className="w-full bg-[#1a1a1a] text-white px-3 sm:px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Descripción corta</label>
                      <input
                        value={form.description || ''}
                        onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                        className="w-full bg-[#1a1a1a] text-white px-3 sm:px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Descripción larga</label>
                      <textarea
                        value={form.longDescription || ''}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, longDescription: e.target.value }))
                        }
                        className="w-full bg-[#1a1a1a] text-white px-3 sm:px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none h-28 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Categoría</label>
                        <input
                          value={form.category || ''}
                          onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                          placeholder="Tecnología"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">SKU</label>
                        <input
                          value={form.sku || ''}
                          onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value.toUpperCase() }))}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none tracking-widest"
                          placeholder="AUR-BT-001"
                        />
                      </div>
                    </div>

                    {/* === NUEVO CAMPO: MEDIA (múltiples URLs) === */}
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">
                        Media (imágenes/videos por links)
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
                        className="w-full bg-[#1a1a1a] text-white px-3 sm:px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none h-28 resize-y"
                        placeholder={"https://ejemplo.com/img1.jpg\nhttps://ejemplo.com/img2.png\nhttps://servidor.com/video.mp4"}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Separa los links por salto de línea (recomendado) o por coma. Soporta .jpg, .png, .webp, .mp4, .webm, .ogg
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Original</label>
                        <input
                          type="number"
                          value={Number(form.originalPrice || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, originalPrice: Number(e.target.value) }))}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Precio</label>
                        <input
                          type="number"
                          value={Number(form.price || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Desc. %</label>
                        <input
                          type="number"
                          value={Number(form.discount || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, discount: Number(e.target.value) }))}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Rating (0–5)</label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={5}
                          value={Number(form.rating || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, rating: Number(e.target.value) }))}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Reviews</label>
                        <input
                          type="number"
                          min={0}
                          value={Number(form.reviews || 0)}
                          onChange={(e) => setForm((s) => ({ ...s, reviews: Number(e.target.value) }))}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Cantidad en stock</label>
                        <input
                          type="number"
                          min={0}
                          value={Number(form.stockQuantity || 0)}
                          onChange={(e) => {
                            const v = Math.max(0, Number(e.target.value));
                            setForm((s) => ({ ...s, stockQuantity: v, inStock: v > 0 }));
                          }}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">¿En stock?</label>
                        <select
                          value={(form.inStock ? '1' : '0') as string}
                          onChange={(e) => setForm((s) => ({ ...s, inStock: e.target.value === '1' }))}
                          className="w-full bg-[#1a1a1a] text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                        >
                          <option value="1">Sí</option>
                          <option value="0">No</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Información de envío</label>
                      <input
                        value={form.shippingInfo || ''}
                        onChange={(e) => setForm((s) => ({ ...s, shippingInfo: e.target.value }))}
                        className="w-full bg-[#1a1a1a] text-white px-3 sm:px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none"
                        placeholder="Envío nacional 3–5 días hábiles"
                      />
                    </div>

                    {/* Vista previa mini de media */}
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Vista previa</label>
                      {form.media && form.media.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {form.media.slice(0, 6).map((m, i) => (
                            <div key={i} className="relative rounded-lg overflow-hidden border border-gray-700/60 bg-black/20 aspect-square flex items-center justify-center">
                              {isVideo(m) ? (
                                <Film className="text-white/80" />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={m} alt={`media-${i}`} className="w-full h-full object-cover" />
                              )}
                              <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">{i+1}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-24 rounded-lg border border-gray-700/60 bg-black/10 flex items-center justify-center text-gray-400">
                          Sin media aún
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-gray-700/50 flex gap-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD600] to-[#FFC400] text-black font-bold px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:shadow-lg hover:shadow-[#FFD600]/25 disabled:opacity-60"
                  >
                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-700/70 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg"
                  >
                    <X size={18} />
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
