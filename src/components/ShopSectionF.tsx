import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  Search, Star, Play, Filter, Grid, List, Heart, Eye, Users, ShoppingCart, ArrowRight, X
} from "lucide-react";

import Header from "./Header";
import { useToast } from "./ToastProvider";
import { useCart } from "../context/CartContext";

type PhysicalProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  inStock: boolean;
  createdAt?: Date;
};

const ShopSectionF: React.FC = () => {
  const [products, setProducts] = useState<PhysicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Filtros
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1_000_000]);
  const [maxPrice, setMaxPrice] = useState(1_000_000);
  const [sortBy, setSortBy] = useState("newest");
  const [minRating, setMinRating] = useState(0);

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const navigate = useNavigate();
  const { push } = useToast();
  const { addToCart, cartItems } = useCart();

  const topRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
    try { document.documentElement.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
    try { document.body.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
  };

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, "products-f"));
        const data: PhysicalProduct[] = [];
        snap.forEach((doc) => {
          const d = doc.data() as any;
          data.push({
            id: doc.id,
            name: d.name || "Producto",
            description: d.description || "",
            category: d.category || "general",
            price: Number(d.price) || 0,
            originalPrice: Number(d.originalPrice ?? d.price) || 0,
            discount: Number(d.discount) || 0,
            rating: Number(d.rating) || 0,
            reviews: Number(d.reviews) || 0,
            imageUrl: d.imageUrl || "",
            inStock: d.inStock !== false,
            createdAt: d.createdAt?.toDate?.() || new Date(),
          });
        });
        setProducts(data.sort(() => Math.random() - 0.5));

        if (data.length > 0) {
          const max = Math.max(...data.map((p) => Number(p.price) || 0));
          const rounded = Math.ceil(max / 100) * 100;
          setMaxPrice(rounded);
          setPriceRange([0, rounded]);
        }
      } catch (err) {
        console.error("Error al cargar productos físicos:", err);
        setError("No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = (p: PhysicalProduct) => {
    addToCart({
      id: p.id,
      name: p.name,
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      price: Number(p.price) || 0,
      quantity: 1,
    });
    push?.({ type: "success", title: "Agregado", message: `${p.name} al carrito` });
  };

  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))],
    [products]
  );

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (p.rating < minRating) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        if (!p.name.toLowerCase().includes(term) && !p.description.toLowerCase().includes(term)) {
          return false;
        }
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "popular") return b.reviews - a.reviews;
      return (b.createdAt as any)?.getTime?.() - (a.createdAt as any)?.getTime?.();
    });
  }, [products, category, priceRange, search, sortBy, minRating]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(id);
  }, [safePage]);

  // Loading / Error
  if (loading) {
    return (
      <div className="min-h-screen bg-pop-yellow dark:bg-gray-950">
        <Header />
        <div className="flex items-center justify-center py-24 animate-fadeIn">
          <div className="flex flex-col items-center comic-panel halftone-pattern p-8">
            <div className="w-12 h-12 rounded-full border-4 border-black dark:border-white border-t-pop-orange dark:border-t-pop-cyan animate-spin mb-3"></div>
            <p className="text-black dark:text-white text-xs font-bold uppercase comic-text-outline">Cargando productos físicos...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-pop-yellow dark:bg-gray-950">
        <Header />
        <div className="flex items-center justify-center py-24 px-4 animate-fadeIn">
          <div className="text-center comic-panel halftone-pattern p-6">
            <p className="text-pop-red font-bold text-xs uppercase comic-text-outline">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Comic Crosshatch Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 crosshatch-pattern text-pop-orange opacity-30"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-pop-orange/20 dark:bg-pop-orange/10 comic-border-light rounded-full animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pop-cyan/20 dark:bg-pop-cyan/10 comic-border-light rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pop-purple/20 dark:bg-pop-purple/10 comic-border-light rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <Header />

      {/* Comic-Style Top Bar */}
      <div className="bg-pop-yellow dark:bg-gray-900 comic-border-light border-b-4 sticky top-0 z-20 halftone-pattern">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[10px] text-black dark:text-white hover:text-pop-orange dark:hover:text-pop-cyan transition-all duration-300 group font-bold uppercase speed-lines"
            >
              <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="comic-text-outline">Volver</span>
            </button>
            <p className="text-black dark:text-white text-[9px] font-bold uppercase comic-text-outline animate-fadeIn">{filtered.length} productos físicos</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-white dark:bg-gray-800 comic-border px-2 py-1.5 bendaydots-pattern text-pop-orange hover:speed-lines transition-all duration-300">
              <Search size={12} className="text-black dark:text-white mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Buscar productos físicos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-black dark:text-white flex-1 placeholder-black/50 dark:placeholder-white/50 text-[10px] font-bold relative z-10"
              />
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`p-1.5 comic-border transition-all duration-300 shrink-0 hover:scale-105 animate-comic-pop font-bold ${
                showFilters ? "bg-pop-orange text-black dark:text-white" : "bg-white dark:bg-gray-800 text-black dark:text-white"
              }`}
              title="Filtros"
            >
              <Filter size={12} />
            </button>

            <div className="flex bg-white dark:bg-gray-800 comic-border p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 transition-all duration-300 ${
                  viewMode === "grid" ? "bg-pop-cyan text-black scale-105" : "text-black dark:text-white hover:scale-105"
                }`}
              >
                <Grid size={10} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 transition-all duration-300 ${
                  viewMode === "list" ? "bg-pop-cyan text-black scale-105" : "text-black dark:text-white hover:scale-105"
                }`}
              >
                <List size={10} />
              </button>
            </div>
          </div>

          {/* Comic-Style Filter Panel */}
          {showFilters && (
            <div className="relative group animate-comic-pop">
              <div className="relative comic-panel halftone-pattern p-3 mt-2 animate-slideDown">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-black dark:text-white comic-text-outline">Filtros</span>
                <button onClick={() => setShowFilters(false)} className="text-black dark:text-white hover:text-pop-red transition-colors duration-300 hover:rotate-90 transition-transform comic-border p-1">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-black dark:text-white mb-1 font-bold uppercase">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="w-full bg-white dark:bg-gray-800 comic-border text-black dark:text-white px-2 py-1 text-[10px] font-bold hover:bg-pop-purple hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "all" ? "Todas" : c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-black dark:text-white mb-1 font-bold uppercase">Ordenar</label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="w-full bg-white dark:bg-gray-800 comic-border text-black dark:text-white px-2 py-1 text-[10px] font-bold hover:bg-pop-purple hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    <option value="newest">Nuevos</option>
                    <option value="price-low">Menor precio</option>
                    <option value="price-high">Mayor precio</option>
                    <option value="rating">Mejor valorados</option>
                    <option value="popular">Más populares</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-black dark:text-white mb-1 font-bold uppercase">
                    Precio máx: ${priceRange[1].toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50}
                    value={priceRange[1]}
                    onChange={(e) => { setPriceRange([0, Number(e.target.value)]); setPage(1); }}
                    className="w-full accent-pop-orange h-2 cursor-pointer"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-black dark:text-white mb-1 font-bold uppercase">Rating mínimo</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => { setMinRating(rating === minRating ? 0 : rating); setPage(1); }}
                        className="transition-all duration-300 hover:scale-125 animate-comic-pop"
                      >
                        <Star
                          size={14}
                          className={
                            rating <= minRating
                              ? "text-pop-yellow fill-current"
                              : "text-black/30 dark:text-white/30 hover:text-pop-yellow"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      <div ref={topRef} />

      {/* Comic Content */}
      <div className="container mx-auto px-3 py-4 md:py-6">
        {paginated.length === 0 ? (
          <div className="text-center py-12 animate-fadeIn">
            <div className="comic-panel halftone-pattern p-6 max-w-sm mx-auto animate-comic-pop">
              <Play size={24} className="text-pop-orange mx-auto mb-2" />
              <p className="text-black dark:text-white text-xs font-bold uppercase comic-text-outline">No hay productos disponibles</p>
            </div>
          </div>
        ) : (
          <div className={viewMode === "grid"
            ? "grid gap-3 md:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            : "space-y-3"}>
            {paginated.map((product, index) => {
              const inCart = cartItems.some((it) => it.id === product.id);
              const isFav = favorites.includes(product.id);

              if (viewMode === "list") {
                return (
                  <div
                    key={product.id}
                    className="relative group animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Comic Speed Lines Effect */}
                    <div className="relative comic-panel bendaydots-pattern text-pop-cyan p-3 flex gap-3 hover:speed-lines-right comic-hover animate-comic-pop">
                    <div className="relative w-24 h-24 shrink-0 comic-border">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-0 left-0 bg-pop-red text-white text-[8px] px-1.5 py-0.5 comic-border font-bold uppercase">
                          -{product.discount}%
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-0 right-0 p-1 bg-pop-yellow hover:scale-110 transition-transform duration-300 comic-border"
                      >
                        <Heart size={10} className={isFav ? "text-pop-red fill-current" : "text-black"} />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <h3 className="text-black dark:text-white font-bold text-[10px] line-clamp-1 mb-0.5 uppercase">{product.name}</h3>
                      <p className="text-black/70 dark:text-white/70 text-[9px] line-clamp-1 mb-1 font-medium">{product.description}</p>

                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={8} className={i <= product.rating ? "text-pop-yellow fill-current" : "text-black/30 dark:text-white/30"} />
                          ))}
                        </div>
                        <span className="text-black/70 dark:text-white/70 text-[8px] font-bold">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-pop-orange font-bold text-xs uppercase comic-text-shadow">
                          ${product.price.toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <Link
                            to={`/product-f/${product.id}`}
                            className="bg-pop-cyan text-black px-2 py-1 comic-border text-[9px] font-bold uppercase hover:scale-105 transition-all duration-300"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock || inCart}
                            className={`px-2 py-1 comic-border text-[9px] font-bold uppercase flex items-center gap-0.5 hover:scale-105 transition-all duration-300 ${
                              inCart ? "bg-pop-green text-black" : "bg-pop-purple text-white hover:bg-pop-orange"
                            } disabled:opacity-50`}
                          >
                            <ShoppingCart size={9} />
                            {inCart ? "✓" : "+"}
                          </button>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                );
              }

              // Vista Grid Comic
              return (
                <div
                  key={product.id}
                  className="group relative animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Comic Panel with Speed Lines on Hover */}
                  <div className="relative comic-panel crosshatch-pattern text-pop-purple overflow-hidden hover:speed-lines-right comic-hover animate-comic-pop">
                  <div className="relative aspect-square overflow-hidden comic-border">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-pop-red text-white text-[8px] px-2 py-1 comic-border font-bold uppercase animate-comic-bounce">
                        -{product.discount}%
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-pop-yellow comic-border hover:scale-110 transition-all duration-300 animate-comic-pop"
                    >
                      <Heart size={10} className={isFav ? "text-pop-red fill-current animate-pulse" : "text-black"} />
                    </button>

                    <div className="absolute inset-0 bg-pop-cyan/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 halftone-pattern">
                      <Link to={`/product-f/${product.id}`} className="p-2 bg-pop-orange comic-border hover:scale-110 transition-transform duration-300 relative z-10">
                        <Eye size={14} className="text-black" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-3 relative z-10 bg-white dark:bg-gray-900">
                    <h3 className="text-black dark:text-white font-bold text-[10px] line-clamp-2 mb-1 min-h-[28px] uppercase">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={8} className={i <= product.rating ? "text-pop-yellow fill-current" : "text-black/30 dark:text-white/30"} />
                        ))}
                      </div>
                      <span className="text-black/70 dark:text-white/70 text-[8px] font-bold">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-pop-orange font-bold text-xs uppercase comic-text-shadow">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-black/50 dark:text-white/50 text-[9px] line-through font-bold">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock || inCart}
                      className={`w-full py-2 comic-border text-[9px] font-bold uppercase flex items-center justify-center gap-1 hover:scale-105 transition-all duration-300 ${
                        inCart
                          ? "bg-pop-green text-black"
                          : "bg-pop-purple text-white hover:bg-pop-orange hover:text-black"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ShoppingCart size={10} />
                      {inCart ? "En carrito" : "Añadir"}
                    </button>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comic Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 animate-fadeIn">
            <button
              disabled={safePage === 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollToTop(); }}
              className="px-3 py-1.5 bg-pop-yellow dark:bg-gray-800 comic-border text-black dark:text-white disabled:opacity-50 text-[10px] font-bold uppercase hover:scale-105 hover:bg-pop-cyan hover:text-black transition-all duration-300 disabled:hover:scale-100 disabled:hover:bg-pop-yellow dark:disabled:hover:bg-gray-800"
            >
              ←
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 3) pageNum = i + 1;
              else if (safePage <= 2) pageNum = i + 1;
              else if (safePage >= totalPages - 1) pageNum = totalPages - 2 + i;
              else pageNum = safePage - 1 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => { setPage(pageNum); scrollToTop(); }}
                  className={`w-8 h-8 comic-border text-[10px] font-bold uppercase transition-all duration-300 hover:scale-110 animate-comic-pop ${
                    safePage === pageNum
                      ? "bg-pop-orange text-black scale-105"
                      : "bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-pop-purple hover:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={safePage === totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); scrollToTop(); }}
              className="px-3 py-1.5 bg-pop-yellow dark:bg-gray-800 comic-border text-black dark:text-white disabled:opacity-50 text-[10px] font-bold uppercase hover:scale-105 hover:bg-pop-cyan hover:text-black transition-all duration-300 disabled:hover:scale-100 disabled:hover:bg-pop-yellow dark:disabled:hover:bg-gray-800"
            >
              →
            </button>
          </div>
        )}
      </div>
      </div>

      {/* CSS Animations for comic background blobs */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ShopSectionF;
