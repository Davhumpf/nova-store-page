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
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex items-center justify-center py-24 animate-fadeIn">
          <div className="flex flex-col items-center classic-card bg-white dark:bg-black border-4 border-black dark:border-white  p-8 shadow-classic-lg">
            <div className="w-12 h-12 rounded-full border-4 border-black dark:border-white border-t-[#FF4500] dark:border-t-[#00FFFF] animate-spin mb-3"></div>
            <p className="text-black dark:text-white text-xs font-bold uppercase ">Cargando productos físicos...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex items-center justify-center py-24 px-4 animate-fadeIn">
          <div className="text-center classic-card bg-white dark:bg-black border-4 border-black dark:border-white  p-6 shadow-classic-lg">
            <p className="text-[#FF4500] dark:text-[#FF4500] font-bold text-xs uppercase ">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Comic Crosshatch Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0  text-black dark:text-white opacity-10"></div>
      </div>

      <div className="relative z-10">
        <Header />

      {/* Comic-Style Top Bar */}
      <div className="bg-white dark:bg-black border border-primary rounded-lg-light border-b-4 border-black dark:border-white sticky top-0 z-20  shadow-classic-md">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[10px] text-black dark:text-white hover:text-accent-primary dark:hover:text-accent-primary transition-all duration-300 group font-bold uppercase "
            >
              <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="">Volver</span>
            </button>
            <p className="text-black dark:text-white text-[9px] font-bold uppercase  animate-fadeIn">{filtered.length} productos físicos</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-white dark:bg-black border border-primary rounded-lg border-4 border-black dark:border-white px-2 py-1.5  hover: transition-all duration-300 shadow-classic-md">
              <Search size={12} className="text-[#FF4500] dark:text-[#00FFFF] mr-1.5 shrink-0" />
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
              className={`p-1.5 border border-primary rounded-lg border-4 border-black dark:border-white transition-all duration-300 shrink-0 hover:scale-105 animate-scale-in font-bold shadow-classic-md ${
                showFilters ? "bg-white dark:bg-black text-[#FF4500] dark:text-[#00FFFF]" : "bg-white dark:bg-black text-black dark:text-white"
              }`}
              title="Filtros"
            >
              <Filter size={12} />
            </button>

            <div className="flex bg-white dark:bg-black border border-primary rounded-lg border-4 border-black dark:border-white p-0.5 shadow-classic-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 transition-all duration-300 ${
                  viewMode === "grid" ? "bg-accent-primary text-black scale-105" : "text-black dark:text-white hover:scale-105"
                }`}
              >
                <Grid size={10} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 transition-all duration-300 ${
                  viewMode === "list" ? "bg-accent-primary text-black scale-105" : "text-black dark:text-white hover:scale-105"
                }`}
              >
                <List size={10} />
              </button>
            </div>
          </div>

          {/* Comic-Style Filter Panel */}
          {showFilters && (
            <div className="relative group animate-scale-in">
              <div className="relative classic-card bg-white dark:bg-black border-4 border-black dark:border-white  p-3 mt-2 animate-slideDown shadow-classic-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-black dark:text-white ">Filtros</span>
                <button onClick={() => setShowFilters(false)} className="text-black dark:text-white hover:text-[#FF4500] dark:hover:text-[#00FFFF] transition-colors duration-300 hover:rotate-90 transition-transform border border-primary rounded-lg bg-white dark:bg-black border-2 border-black dark:border-white p-1 shadow-classic-sm">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-black dark:text-white mb-1 font-bold uppercase">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="w-full bg-white dark:bg-black border border-primary rounded-lg border-3 border-black dark:border-white text-black dark:text-white px-2 py-1 text-[10px] font-bold transition-all duration-300 cursor-pointer shadow-classic-md"
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
                    className="w-full bg-white dark:bg-black border border-primary rounded-lg border-3 border-black dark:border-white text-black dark:text-white px-2 py-1 text-[10px] font-bold transition-all duration-300 cursor-pointer shadow-classic-md"
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
                    className="w-full accent-accent-primary h-2 cursor-pointer"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-black dark:text-white mb-1 font-bold uppercase">Rating mínimo</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => { setMinRating(rating === minRating ? 0 : rating); setPage(1); }}
                        className="transition-all duration-300 hover:scale-125 animate-scale-in"
                      >
                        <Star
                          size={14}
                          className={
                            rating <= minRating
                              ? "text-accent-primary fill-current"
                              : "text-black/30 dark:text-white/30 hover:text-accent-primary"
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
            <div className="classic-card bg-white dark:bg-black border-4 border-black dark:border-white  p-6 max-w-sm mx-auto animate-scale-in shadow-classic-lg">
              <Play size={24} className="text-[#FF4500] dark:text-[#00FFFF] mx-auto mb-2" />
              <p className="text-black dark:text-white text-xs font-bold uppercase ">No hay productos disponibles</p>
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
                    <div className="relative classic-card bg-white dark:bg-black border-4 border-black dark:border-white  p-3 flex gap-3 hover:-right transition-all duration-200 hover:shadow-classic-md animate-scale-in shadow-classic-md">
                    <div className="relative w-24 h-24 shrink-0 border border-primary rounded-lg border-3 border-black dark:border-white">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-0 left-0 bg-accent-error text-white text-[8px] px-1.5 py-0.5 border border-primary rounded-lg font-bold uppercase">
                          -{product.discount}%
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-0 right-0 p-1 bg-white dark:bg-black hover:scale-110 transition-transform duration-300 border border-primary rounded-lg border-2 border-black dark:border-white shadow-classic-sm"
                      >
                        <Heart size={10} className={isFav ? "text-[#FF1493] fill-current" : "text-black dark:text-white"} />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <h3 className="text-black dark:text-white font-bold text-[10px] line-clamp-1 mb-0.5 uppercase">{product.name}</h3>
                      <p className="text-black/70 dark:text-white/70 text-[9px] line-clamp-1 mb-1 font-medium">{product.description}</p>

                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={8} className={i <= product.rating ? "text-accent-primary fill-current" : "text-black/30 dark:text-white/30"} />
                          ))}
                        </div>
                        <span className="text-black/70 dark:text-white/70 text-[8px] font-bold">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-accent-primary font-bold text-xs uppercase title-shadow">
                          ${product.price.toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <Link
                            to={`/product-f/${product.id}`}
                            className="bg-accent-primary text-black px-2 py-1 border border-primary rounded-lg text-[9px] font-bold uppercase hover:scale-105 transition-all duration-300"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock || inCart}
                            className={`px-2 py-1 border border-primary rounded-lg text-[9px] font-bold uppercase flex items-center gap-0.5 hover:scale-105 transition-all duration-300 ${
                              inCart ? "bg-accent-success text-black" : "bg-accent-primary text-white hover:bg-accent-primary"
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
                  <div className="relative classic-card bg-white dark:bg-black border-4 border-black dark:border-white  overflow-hidden hover:-right transition-all duration-200 hover:shadow-classic-md animate-scale-in shadow-classic-md">
                  <div className="relative aspect-square overflow-hidden border border-primary rounded-lg border-b-4 border-black dark:border-white">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-accent-error text-white text-[8px] px-2 py-1 border border-primary rounded-lg font-bold uppercase ">
                        -{product.discount}%
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white dark:bg-black border border-primary rounded-lg border-2 border-black dark:border-white hover:scale-110 transition-all duration-300 animate-scale-in shadow-classic-sm"
                    >
                      <Heart size={10} className={isFav ? "text-[#FF1493] fill-current animate-pulse" : "text-black dark:text-white"} />
                    </button>

                    <div className="absolute inset-0 bg-white/90 dark:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 ">
                      <Link to={`/product-f/${product.id}`} className="p-2 bg-white dark:bg-black border border-primary rounded-lg border-3 border-black dark:border-white hover:scale-110 transition-transform duration-300 relative z-10 shadow-classic-md">
                        <Eye size={14} className="text-black dark:text-white" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-3 relative z-10 bg-white dark:bg-black">
                    <h3 className="text-black dark:text-white font-bold text-[10px] line-clamp-2 mb-1 min-h-[28px] uppercase">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={8} className={i <= product.rating ? "text-accent-primary fill-current" : "text-black/30 dark:text-white/30"} />
                        ))}
                      </div>
                      <span className="text-black/70 dark:text-white/70 text-[8px] font-bold">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-accent-primary font-bold text-xs uppercase title-shadow">
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
                      className={`w-full py-2 border border-primary rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-1 hover:scale-105 transition-all duration-300 ${
                        inCart
                          ? "bg-accent-success text-black"
                          : "bg-accent-primary text-white hover:bg-accent-primary hover:text-black"
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
              className="px-3 py-1.5 bg-white dark:bg-black border border-primary rounded-lg border-3 border-black dark:border-white text-black dark:text-white disabled:opacity-50 text-[10px] font-bold uppercase hover:scale-105 transition-all duration-300 disabled:hover:scale-100 shadow-classic-md"
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
                  className={`w-8 h-8 border border-primary rounded-lg border-3 border-black dark:border-white text-[10px] font-bold uppercase transition-all duration-300 hover:scale-110 animate-scale-in shadow-classic-md ${
                    safePage === pageNum
                      ? "bg-white dark:bg-black text-[#FF4500] dark:text-[#00FFFF] scale-105"
                      : "bg-white dark:bg-black text-black dark:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={safePage === totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); scrollToTop(); }}
              className="px-3 py-1.5 bg-white dark:bg-black border border-primary rounded-lg border-3 border-black dark:border-white text-black dark:text-white disabled:opacity-50 text-[10px] font-bold uppercase hover:scale-105 transition-all duration-300 disabled:hover:scale-100 shadow-classic-md"
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
