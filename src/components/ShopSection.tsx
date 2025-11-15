import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { Product } from "../types";
import {
  Search, Star, Play, Filter, Grid, List, Heart, Eye, Users, ShoppingCart, ArrowRight, X
} from "lucide-react";

import Header from "./Header";
import { useToast } from "./ToastProvider";
import { useCart } from "../context/CartContext";

const ShopSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("newest");
  const [minRating, setMinRating] = useState(0);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const { push } = useToast();
  const { addToCart, cartItems } = useCart();

  const topRef = useRef<HTMLDivElement | null>(null);
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, "products"));
        const data: Product[] = [];
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
            createdAt: d.createdAt?.toDate?.() || new Date(0),
          } as Product);
        });

        setProducts(data);

        if (data.length > 0) {
          const max = Math.max(...data.map((p) => Number(p.price) || 0));
          const rounded = Math.ceil(max / 100) * 100;
          setMaxPrice(rounded);
          setPriceRange([0, rounded]);
        }
      } catch (err) {
        console.error("Error al cargar productos:", err);
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

  const handleAddToCart = (p: Product) => {
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
      const at = (a.createdAt as any)?.getTime?.() ?? 0;
      const bt = (b.createdAt as any)?.getTime?.() ?? 0;
      return bt - at;
    });
  }, [products, category, priceRange, search, sortBy, minRating]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(id);
  }, [safePage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFEB3B] dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 halftone-pattern opacity-20 dark:opacity-10 pointer-events-none"></div>
        <Header />
        <div className="flex items-center justify-center py-24 animate-fadeIn relative z-10">
          <div className="flex flex-col items-center comic-panel bg-white dark:bg-gray-800 border-4 border-black dark:border-[#00FFFF] p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(0,255,255,0.5)] relative overflow-hidden">
            <div className="absolute inset-0 bendaydots-pattern opacity-20 dark:opacity-10 pointer-events-none"></div>
            <div className="w-12 h-12 border-4 border-black dark:border-[#00FFFF] border-t-[#FF1493] dark:border-t-[#FF1493] animate-spin mb-3 relative z-10"></div>
            <p className="text-black dark:text-white text-xs font-black uppercase relative z-10 comic-text-shadow">¡Cargando productos!</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFEB3B] dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 halftone-pattern opacity-20 dark:opacity-10 pointer-events-none"></div>
        <Header />
        <div className="flex items-center justify-center py-24 px-4 animate-fadeIn relative z-10">
          <div className="text-center comic-panel bg-[#FF4500] dark:bg-gray-800 border-4 border-black dark:border-red-700 p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,0,0,0.5)] relative overflow-hidden">
            <div className="absolute inset-0 stipple-pattern opacity-30 dark:opacity-20 pointer-events-none"></div>
            <p className="text-white dark:text-red-400 text-xs font-black uppercase relative z-10 comic-text-shadow">¡Error! {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFEB3B] dark:bg-gray-900 relative overflow-hidden">
      {/* Comic halftone background pattern */}
      <div className="absolute inset-0 halftone-pattern opacity-20 dark:opacity-10 pointer-events-none"></div>

      {/* Pop art color blocks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[#FF1493] opacity-30 dark:opacity-20 rounded-full mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-[#00FFFF] opacity-30 dark:opacity-20 rounded-full mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[#FF4500] opacity-30 dark:opacity-20 rounded-full mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <Header /></div>

      {/* Comic-style top bar */}
      <div className="comic-border bg-white dark:bg-gray-800 border-b-4 border-black dark:border-[#00FFFF] sticky top-0 z-20 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(0,255,255,0.5)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bendaydots-pattern opacity-10 dark:opacity-5 pointer-events-none"></div>
        <div className="container mx-auto px-3 py-2 relative z-10">
          {/* Título y volver */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[10px] text-black dark:text-[#00FFFF] hover:text-[#FF1493] dark:hover:text-[#FF1493] transition-all duration-300 group font-bold comic-text-shadow relative speed-lines-on-hover"
            >
              <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-black uppercase tracking-wider">¡Volver!</span>
            </button>
            <p className="text-black dark:text-[#FFEB3B] text-[9px] font-black animate-fadeIn comic-border bg-[#FF1493] dark:bg-[#FF4500] text-white px-2 py-0.5 rotate-2 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">{filtered.length} PRODUCTOS</p>
          </div>

          {/* Buscador y controles - Comic Style */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center comic-border bg-[#FFEB3B] dark:bg-gray-700 border-4 border-black dark:border-[#00FFFF] px-2 py-1.5 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] dark:shadow-[3px_3px_0px_rgba(0,255,255,0.5)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[5px_5px_0px_rgba(0,255,255,0.5)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden speed-lines-on-hover">
              <div className="absolute inset-0 stipple-pattern opacity-20 dark:opacity-10 pointer-events-none"></div>
              <Search size={12} className="text-black dark:text-[#00FFFF] mr-1.5 shrink-0 relative z-10 animate-comic-pop" />
              <input
                type="text"
                placeholder="¡BUSCA AQUÍ!"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-black dark:text-white flex-1 placeholder-black/70 dark:placeholder-[#00FFFF]/70 text-[10px] font-bold uppercase relative z-10"
              />
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`comic-border p-1.5 transition-all duration-300 shrink-0 animate-comic-pop hover:animate-comic-bounce border-4 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.8)] hover:-translate-x-0.5 hover:-translate-y-0.5 speed-lines-on-hover ${
                showFilters
                  ? "bg-[#FF1493] dark:bg-[#FF4500] text-white border-black dark:border-[#00FFFF] shadow-[3px_3px_0px_rgba(0,0,0,0.8)] dark:shadow-[3px_3px_0px_rgba(0,255,255,0.5)]"
                  : "bg-white dark:bg-gray-700 border-black dark:border-[#00FFFF] text-black dark:text-[#00FFFF]"
              }`}
              title="Filtros"
            >
              <Filter size={12} />
            </button>

            <div className="flex comic-border bg-white dark:bg-gray-700 border-4 border-black dark:border-[#00FFFF] p-0.5 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] dark:shadow-[3px_3px_0px_rgba(0,255,255,0.5)]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 transition-all duration-300 animate-comic-pop ${
                  viewMode === "grid"
                    ? "bg-[#00FFFF] dark:bg-[#FF1493] text-black dark:text-white scale-105 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                    : "text-black dark:text-[#00FFFF] hover:scale-105"
                }`}
              >
                <Grid size={10} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 transition-all duration-300 animate-comic-pop ${
                  viewMode === "list"
                    ? "bg-[#00FFFF] dark:bg-[#FF1493] text-black dark:text-white scale-105 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                    : "text-black dark:text-[#00FFFF] hover:scale-105"
                }`}
              >
                <List size={10} />
              </button>
            </div>
          </div>

          {/* Comic-style filter panel */}
          {showFilters && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#FF1493] dark:bg-[#00FFFF] rounded-none blur-sm opacity-50 group-hover:opacity-70 transition-opacity animate-comic-pop"></div>
              <div className="relative comic-panel bg-[#FFD700] dark:bg-gray-800 backdrop-blur-xl border-4 border-black dark:border-[#FF1493] p-3 mt-2 animate-slideDown shadow-[6px_6px_0px_rgba(0,0,0,0.8)] dark:shadow-[6px_6px_0px_rgba(255,20,147,0.6)] overflow-hidden">
              <div className="absolute inset-0 halftone-pattern opacity-30 dark:opacity-20 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-wider comic-text-shadow">⚡ Filtros ⚡</span>
                <button onClick={() => setShowFilters(false)} className="text-black dark:text-[#FF1493] hover:text-[#FF1493] dark:hover:text-[#00FFFF] transition-colors duration-300 hover:rotate-90 transition-transform comic-border bg-white dark:bg-gray-700 border-2 border-black dark:border-[#00FFFF] p-1 shadow-[2px_2px_0px_rgba(0,0,0,0.8)] animate-comic-pop">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 relative z-10">
                <div>
                  <label className="block text-[9px] text-black dark:text-[#FFEB3B] mb-1 font-bold uppercase">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="w-full comic-border bg-white dark:bg-gray-600 border-3 border-black dark:border-[#00FFFF] text-black dark:text-white px-2 py-1 text-[10px] font-bold shadow-[3px_3px_0px_rgba(0,0,0,0.8)] dark:shadow-[3px_3px_0px_rgba(0,255,255,0.5)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[4px_4px_0px_rgba(0,255,255,0.5)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-comic-pop"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "all" ? "TODAS" : c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-black dark:text-[#FFEB3B] mb-1 font-bold uppercase">Ordenar</label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="w-full comic-border bg-white dark:bg-gray-600 border-3 border-black dark:border-[#00FFFF] text-black dark:text-white px-2 py-1 text-[10px] font-bold shadow-[3px_3px_0px_rgba(0,0,0,0.8)] dark:shadow-[3px_3px_0px_rgba(0,255,255,0.5)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[4px_4px_0px_rgba(0,255,255,0.5)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-comic-pop"
                  >
                    <option value="newest">NUEVOS</option>
                    <option value="price-low">$ MENOR</option>
                    <option value="price-high">$ MAYOR</option>
                    <option value="rating">⭐ TOP</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-black dark:text-[#FFEB3B] mb-1 font-bold uppercase">
                    💰 Precio máx: ${priceRange[1].toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50}
                    value={priceRange[1]}
                    onChange={(e) => { setPriceRange([0, Number(e.target.value)]); setPage(1); }}
                    className="w-full accent-[#FF1493] dark:accent-[#00FFFF] h-2 cursor-pointer"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-black dark:text-[#FFEB3B] mb-1 font-bold uppercase">⭐ Rating mínimo</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => { setMinRating(rating === minRating ? 0 : rating); setPage(1); }}
                        className="transition-all duration-300 hover:scale-125 animate-comic-pop comic-border bg-white dark:bg-gray-700 border-2 border-black dark:border-[#00FFFF] p-1 shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:shadow-[2px_2px_0px_rgba(0,255,255,0.5)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
                      >
                        <Star
                          size={14}
                          className={
                            rating <= minRating
                              ? "text-[#FFD700] fill-current drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                              : "text-black/30 dark:text-gray-500 hover:text-black/50 dark:hover:text-gray-400"
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

      {/* Contenido */}
      <div className="container mx-auto px-3 py-4 md:py-6">
        {paginated.length === 0 ? (
          <div className="text-center py-12 animate-fadeIn">
            <div className="comic-panel bg-[#FFD700] dark:bg-gray-800 border-4 border-black dark:border-[#FF1493] p-6 max-w-sm mx-auto shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,20,147,0.6)] relative overflow-hidden">
              <div className="absolute inset-0 halftone-pattern opacity-30 dark:opacity-20 pointer-events-none"></div>
              <Play size={24} className="text-black dark:text-[#00FFFF] mx-auto mb-2 relative z-10 animate-comic-pop" />
              <p className="text-black dark:text-white text-xs font-black uppercase relative z-10 comic-text-shadow">¡No hay productos!</p>
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
                    {/* Comic glow effect */}
                    <div className="absolute -inset-1 bg-[#FF1493] dark:bg-[#00FFFF] blur opacity-0 group-hover:opacity-40 transition-opacity duration-500 animate-comic-pop"></div>

                    <div className="relative comic-panel bg-white dark:bg-gray-800 backdrop-blur-xl border-4 border-black dark:border-[#00FFFF] p-3 flex gap-3 shadow-[5px_5px_0px_rgba(0,0,0,0.8)] dark:shadow-[5px_5px_0px_rgba(0,255,255,0.5)] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[8px_8px_0px_rgba(0,255,255,0.5)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-500 overflow-hidden speed-lines-on-hover group-hover:animate-comic-bounce">
                    <div className="absolute inset-0 stipple-pattern opacity-10 dark:opacity-5 pointer-events-none"></div>
                    <div className="relative w-24 h-24 shrink-0 z-10">
                      <div className="comic-border border-3 border-black dark:border-[#FF1493] overflow-hidden h-full">
                        <img
                          src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {product.discount > 0 && (
                        <div className="absolute -top-1 -left-1 comic-border bg-[#FF1493] dark:bg-[#FF4500] text-white text-[8px] px-1.5 py-0.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_rgba(0,0,0,0.8)] font-black rotate-[-12deg] animate-comic-pop">
                          -{product.discount}%
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute -top-1 -right-1 p-1 comic-border bg-white dark:bg-gray-900 border-2 border-black dark:border-[#FF1493] backdrop-blur-sm hover:scale-110 transition-transform duration-300 shadow-[2px_2px_0px_rgba(0,0,0,0.8)] animate-comic-pop"
                      >
                        <Heart size={10} className={isFav ? "text-[#FF1493] fill-current" : "text-black dark:text-[#00FFFF]"} />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <h3 className="text-black dark:text-white font-black text-[10px] line-clamp-1 mb-0.5 uppercase comic-text-shadow">{product.name}</h3>
                      <p className="text-black/70 dark:text-gray-400 text-[9px] line-clamp-1 mb-1 font-medium">{product.description}</p>

                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={8} className={i <= product.rating ? "text-[#FFD700] fill-current drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" : "text-black/20 dark:text-gray-600"} />
                          ))}
                        </div>
                        <span className="text-black/70 dark:text-gray-400 text-[8px] font-bold">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="comic-border bg-[#FFEB3B] dark:bg-[#FF4500] text-black dark:text-white font-black text-xs px-2 py-0.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_rgba(0,0,0,0.8)] rotate-[-2deg]">
                          ${product.price.toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <Link
                            to={`/product/${product.id}`}
                            className="comic-border bg-white dark:bg-gray-700 border-3 border-black dark:border-[#00FFFF] text-black dark:text-white px-2 py-1 text-[9px] font-bold uppercase shadow-[2px_2px_0px_rgba(0,0,0,0.8)] dark:shadow-[2px_2px_0px_rgba(0,255,255,0.5)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[3px_3px_0px_rgba(0,255,255,0.5)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 animate-comic-pop"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock || inCart}
                            className={`comic-border px-2 py-1 text-[9px] font-black flex items-center gap-0.5 transition-all duration-300 border-3 shadow-[2px_2px_0px_rgba(0,0,0,0.8)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.8)] hover:-translate-x-0.5 hover:-translate-y-0.5 uppercase animate-comic-pop ${
                              inCart
                                ? "bg-[#00FF00] text-black border-black"
                                : "bg-[#FF1493] dark:bg-[#00FFFF] text-white dark:text-black border-black dark:border-black"
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
                  {/* Comic glow effect */}
                  <div className="absolute -inset-1 bg-[#FF1493] dark:bg-[#00FFFF] blur opacity-0 group-hover:opacity-50 transition-opacity duration-500 animate-comic-pop"></div>

                  <div className="relative comic-panel bg-white dark:bg-gray-800 backdrop-blur-xl border-4 border-black dark:border-[#00FFFF] overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,0.8)] dark:shadow-[5px_5px_0px_rgba(0,255,255,0.5)] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[8px_8px_0px_rgba(0,255,255,0.5)] hover:-translate-x-1 hover:-translate-y-2 transition-all duration-500 speed-lines-on-hover group-hover:animate-comic-bounce">
                  <div className="absolute inset-0 halftone-pattern opacity-20 dark:opacity-10 pointer-events-none"></div>
                  <div className="relative aspect-square overflow-hidden border-b-4 border-black dark:border-[#FF1493]">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 comic-border bg-[#FF1493] dark:bg-[#FF4500] text-white text-[8px] px-2 py-1 border-2 border-black dark:border-white shadow-[3px_3px_0px_rgba(0,0,0,0.8)] font-black rotate-[-8deg] animate-comic-pop">
                        -{product.discount}%
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-1.5 comic-border bg-white dark:bg-gray-900 border-2 border-black dark:border-[#FF1493] backdrop-blur-sm hover:scale-110 transition-all duration-300 shadow-[2px_2px_0px_rgba(0,0,0,0.8)] animate-comic-pop"
                    >
                      <Heart size={10} className={isFav ? "text-[#FF1493] fill-current animate-pulse" : "text-black dark:text-[#00FFFF]"} />
                    </button>

                    <div className="absolute inset-0 bg-[#FFEB3B] dark:bg-black/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Link to={`/product/${product.id}`} className="comic-border p-2 bg-white dark:bg-gray-700 border-3 border-black dark:border-[#00FFFF] hover:scale-110 transition-transform duration-300 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(0,255,255,0.5)] animate-comic-bounce">
                        <Eye size={14} className="text-black dark:text-white" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-3 relative z-10">
                    <h3 className="text-black dark:text-white font-black text-[10px] line-clamp-2 mb-1 min-h-[28px] uppercase comic-text-shadow">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={8} className={i <= product.rating ? "text-[#FFD700] fill-current drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" : "text-black/20 dark:text-gray-600"} />
                        ))}
                      </div>
                      <span className="text-black/70 dark:text-gray-400 text-[8px] font-bold">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="comic-border bg-[#FFEB3B] dark:bg-[#FF4500] text-black dark:text-white font-black text-xs px-2 py-0.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_rgba(0,0,0,0.8)] rotate-[-2deg]">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-black/50 dark:text-gray-400 text-[9px] line-through font-bold">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock || inCart}
                      className={`w-full comic-border py-2 text-[9px] font-black flex items-center justify-center gap-1 transition-all duration-300 border-3 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:-translate-x-0.5 hover:-translate-y-0.5 uppercase animate-comic-pop ${
                        inCart
                          ? "bg-[#00FF00] text-black border-black"
                          : "bg-[#FF1493] dark:bg-[#00FFFF] text-white dark:text-black border-black dark:border-black"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ShoppingCart size={10} />
                      {inCart ? "✓ En carrito" : "¡Añadir!"}
                    </button>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comic-style pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 animate-fadeIn">
            <button
              disabled={safePage === 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollToTop(); }}
              className="comic-border px-3 py-1.5 bg-[#FFEB3B] dark:bg-gray-800 border-3 border-black dark:border-[#00FFFF] text-black dark:text-white disabled:opacity-50 text-[10px] font-black hover:scale-105 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] dark:shadow-[3px_3px_0px_rgba(0,255,255,0.5)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[4px_4px_0px_rgba(0,255,255,0.5)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 disabled:hover:scale-100 disabled:hover:translate-x-0 disabled:hover:translate-y-0 animate-comic-pop uppercase speed-lines-on-hover"
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
                  className={`comic-border w-8 h-8 text-[10px] font-black transition-all duration-300 hover:scale-110 border-3 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:-translate-x-0.5 hover:-translate-y-0.5 uppercase animate-comic-pop ${
                    safePage === pageNum
                      ? "bg-[#FF1493] dark:bg-[#00FFFF] text-white dark:text-black border-black scale-110 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(0,0,0,0.8)]"
                      : "bg-white dark:bg-gray-800 border-black dark:border-[#00FFFF] text-black dark:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={safePage === totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); scrollToTop(); }}
              className="comic-border px-3 py-1.5 bg-[#FFEB3B] dark:bg-gray-800 border-3 border-black dark:border-[#00FFFF] text-black dark:text-white disabled:opacity-50 text-[10px] font-black hover:scale-105 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] dark:shadow-[3px_3px_0px_rgba(0,255,255,0.5)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[4px_4px_0px_rgba(0,255,255,0.5)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 disabled:hover:scale-100 disabled:hover:translate-x-0 disabled:hover:translate-y-0 animate-comic-pop uppercase speed-lines-on-hover"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* CSS Animations for comic effects */}
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

        /* Comic book effects */
        .comic-border {
          position: relative;
        }

        .comic-panel {
          position: relative;
        }

        .comic-text-shadow {
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
        }

        @keyframes comic-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-comic-pop {
          animation: comic-pop 2s ease-in-out infinite;
        }

        @keyframes comic-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .group:hover .group-hover\\:animate-comic-bounce {
          animation: comic-bounce 0.6s ease-in-out;
        }

        /* Halftone pattern */
        .halftone-pattern {
          background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
          background-size: 8px 8px;
          background-position: 0 0, 4px 4px;
        }

        /* Ben-Day dots pattern */
        .bendaydots-pattern {
          background-image: radial-gradient(circle, currentColor 1.5px, transparent 1.5px);
          background-size: 10px 10px;
        }

        /* Stipple pattern */
        .stipple-pattern {
          background-image: radial-gradient(circle, currentColor 0.8px, transparent 0.8px);
          background-size: 6px 6px;
          background-position: 0 0, 3px 3px;
        }

        /* Speed lines effect on hover */
        .speed-lines-on-hover {
          position: relative;
          overflow: hidden;
        }

        .speed-lines-on-hover::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 20, 147, 0.6), transparent);
          transform: translateY(-50%);
          opacity: 0;
          transition: all 0.3s ease;
        }

        .speed-lines-on-hover:hover::before {
          left: 100%;
          opacity: 1;
          animation: speed-lines 0.6s ease-in-out;
        }

        @keyframes speed-lines {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* Dark mode adjustments for patterns */
        @media (prefers-color-scheme: dark) {
          .halftone-pattern {
            color: rgba(0, 255, 255, 0.3);
          }
          .bendaydots-pattern {
            color: rgba(255, 20, 147, 0.3);
          }
          .stipple-pattern {
            color: rgba(255, 215, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default ShopSection;