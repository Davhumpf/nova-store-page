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
      <div className="min-h-screen bg-[#E8E8E8] dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24 animate-fadeIn">
          <div className="flex flex-col items-center bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 rounded-full border-3 border-[#4CAF50]/30 border-t-[#4CAF50] dark:border-[#66FF7A]/30 dark:border-t-[#66FF7A] animate-spin mb-3"></div>
            <p className="text-[#5A5A5A] dark:text-gray-400 text-xs font-light">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E8E8E8] dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24 px-4 animate-fadeIn">
          <div className="text-center bg-[#F5F5F5] dark:bg-gray-800 border border-red-300 dark:border-red-700 p-6 rounded-2xl shadow-lg">
            <p className="text-red-500 dark:text-red-400 text-xs font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#FAFAFA] to-[#F0F0F0] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[#4CAF50]/10 dark:bg-[#66FF7A]/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-[#BA68C8]/10 dark:bg-[#CE93D8]/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[#4FC3F7]/10 dark:bg-[#81D4FA]/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <Header /></div>

      {/* Barra superior futurista */}
      <div className="bg-white/80 dark:bg-gray-800/80 border-b border-[#4CAF50]/10 dark:border-[#66FF7A]/10 sticky top-0 z-20 shadow-[0_10px_40px_rgba(76,175,80,0.1)] dark:shadow-[0_10px_40px_rgba(102,255,122,0.05)] backdrop-blur-xl">
        <div className="container mx-auto px-3 py-2">
          {/* Título y volver */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[10px] text-[#4CAF50] dark:text-[#66FF7A] hover:text-[#45a049] dark:hover:text-[#4CAF50] transition-all duration-300 group"
            >
              <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Volver</span>
            </button>
            <p className="text-[#8A8A8A] dark:text-gray-400 text-[9px] font-light animate-fadeIn">{filtered.length} productos</p>
          </div>

          {/* Buscador y controles */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 px-2 py-1.5 rounded-xl hover:border-[#4CAF50] dark:hover:border-[#66FF7A] transition-all duration-300">
              <Search size={12} className="text-[#8A8A8A] dark:text-gray-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-[#2A2A2A] dark:text-white flex-1 placeholder-[#8A8A8A] dark:placeholder-gray-400 text-[10px]"
              />
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`p-1.5 rounded-xl transition-all duration-300 shrink-0 hover:scale-105 ${
                showFilters ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900 shadow-md" : "bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 text-[#8A8A8A] dark:text-gray-400"
              }`}
              title="Filtros"
            >
              <Filter size={12} />
            </button>

            <div className="flex bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded-lg transition-all duration-300 ${
                  viewMode === "grid" ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900 scale-105" : "text-[#8A8A8A] dark:text-gray-400 hover:scale-105"
                }`}
              >
                <Grid size={10} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded-lg transition-all duration-300 ${
                  viewMode === "list" ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900 scale-105" : "text-[#8A8A8A] dark:text-gray-400 hover:scale-105"
                }`}
              >
                <List size={10} />
              </button>
            </div>
          </div>

          {/* Panel de filtros futurista */}
          {showFilters && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4CAF50] via-[#66FF7A] to-[#4CAF50] rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-[#4CAF50]/20 dark:border-[#66FF7A]/20 p-3 mt-2 animate-slideDown shadow-[0_10px_40px_rgba(76,175,80,0.15)] dark:shadow-[0_10px_40px_rgba(102,255,122,0.1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-[#2A2A2A] dark:text-white">Filtros</span>
                <button onClick={() => setShowFilters(false)} className="text-[#8A8A8A] dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300 hover:rotate-90 transition-transform">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-[#8A8A8A] dark:text-gray-400 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="w-full bg-[#F5F5F5] dark:bg-gray-600 border border-[#D0D0D0] dark:border-gray-500 text-[#2A2A2A] dark:text-white px-2 py-1 rounded-lg text-[10px] hover:border-[#4CAF50] dark:hover:border-[#66FF7A] transition-all duration-300 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "all" ? "Todas" : c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-[#8A8A8A] dark:text-gray-400 mb-1">Ordenar</label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="w-full bg-[#F5F5F5] dark:bg-gray-600 border border-[#D0D0D0] dark:border-gray-500 text-[#2A2A2A] dark:text-white px-2 py-1 rounded-lg text-[10px] hover:border-[#4CAF50] dark:hover:border-[#66FF7A] transition-all duration-300 cursor-pointer"
                  >
                    <option value="newest">Nuevos</option>
                    <option value="price-low">Menor precio</option>
                    <option value="price-high">Mayor precio</option>
                    <option value="rating">Mejor valorados</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-[#8A8A8A] dark:text-gray-400 mb-1">
                    Precio máx: ${priceRange[1].toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50}
                    value={priceRange[1]}
                    onChange={(e) => { setPriceRange([0, Number(e.target.value)]); setPage(1); }}
                    className="w-full accent-[#4CAF50] dark:accent-[#66FF7A] h-1 cursor-pointer"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-[#8A8A8A] dark:text-gray-400 mb-1">Rating mínimo</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => { setMinRating(rating === minRating ? 0 : rating); setPage(1); }}
                        className="transition-all duration-300 hover:scale-125"
                      >
                        <Star
                          size={14}
                          className={
                            rating <= minRating
                              ? "text-[#FFB800] fill-current"
                              : "text-[#D0D0D0] dark:text-gray-500 hover:text-[#8A8A8A] dark:hover:text-gray-400"
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
            <div className="bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 rounded-2xl p-6 max-w-sm mx-auto shadow-sm">
              <Play size={24} className="text-[#D0D0D0] dark:text-gray-600 mx-auto mb-2" />
              <p className="text-[#5A5A5A] dark:text-gray-400 text-xs font-light">No hay productos disponibles</p>
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
                    {/* Glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4CAF50] via-[#66FF7A] to-[#4CAF50] rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-[#4CAF50]/10 dark:border-[#66FF7A]/10 rounded-2xl p-3 flex gap-3 hover:shadow-[0_20px_60px_rgba(76,175,80,0.2)] dark:hover:shadow-[0_20px_60px_rgba(102,255,122,0.15)] hover:scale-[1.02] transition-all duration-500">
                    <div className="relative w-24 h-24 shrink-0">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-lg shadow-md">
                          -{product.discount}%
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-0 right-0 p-1 bg-white/90 dark:bg-gray-900/90 rounded-lg backdrop-blur-sm hover:scale-110 transition-transform duration-300"
                      >
                        <Heart size={10} className={isFav ? "text-red-500 fill-current" : "text-[#8A8A8A] dark:text-gray-400"} />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#2A2A2A] dark:text-white font-medium text-[10px] line-clamp-1 mb-0.5">{product.name}</h3>
                      <p className="text-[#8A8A8A] dark:text-gray-400 text-[9px] line-clamp-1 mb-1">{product.description}</p>

                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={8} className={i <= product.rating ? "text-[#FFB800] fill-current" : "text-[#D0D0D0] dark:text-gray-600"} />
                          ))}
                        </div>
                        <span className="text-[#8A8A8A] dark:text-gray-400 text-[8px]">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#4CAF50] dark:text-[#66FF7A] font-bold text-xs">
                          ${product.price.toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <Link
                            to={`/product/${product.id}`}
                            className="bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 text-[#2A2A2A] dark:text-white px-2 py-1 rounded-lg text-[9px] hover:bg-[#FAFAFA] dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock || inCart}
                            className={`px-2 py-1 rounded-lg text-[9px] font-medium flex items-center gap-0.5 hover:scale-105 transition-all duration-300 ${
                              inCart ? "bg-green-500 text-white" : "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900 hover:bg-[#45a049] dark:hover:bg-[#4CAF50]"
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

              // Vista Grid Futurista
              return (
                <div
                  key={product.id}
                  className="group relative animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4CAF50] via-[#66FF7A] to-[#4CAF50] rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-[#4CAF50]/10 dark:border-[#66FF7A]/10 rounded-2xl overflow-hidden hover:shadow-[0_20px_60px_rgba(76,175,80,0.2)] dark:hover:shadow-[0_20px_60px_rgba(102,255,122,0.15)] hover:scale-[1.03] hover:-translate-y-2 transition-all duration-500">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] px-2 py-1 rounded-lg shadow-md animate-pulse">
                        -{product.discount}%
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-xl backdrop-blur-sm hover:scale-110 transition-all duration-300"
                    >
                      <Heart size={10} className={isFav ? "text-red-500 fill-current animate-pulse" : "text-[#8A8A8A] dark:text-gray-400"} />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Link to={`/product/${product.id}`} className="p-2 bg-white dark:bg-gray-700 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Eye size={14} className="text-[#2A2A2A] dark:text-white" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-[#2A2A2A] dark:text-white font-medium text-[10px] line-clamp-2 mb-1 min-h-[28px]">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={8} className={i <= product.rating ? "text-[#FFB800] fill-current" : "text-[#D0D0D0] dark:text-gray-600"} />
                        ))}
                      </div>
                      <span className="text-[#8A8A8A] dark:text-gray-400 text-[8px]">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#4CAF50] dark:text-[#66FF7A] font-bold text-xs">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-[#8A8A8A] dark:text-gray-400 text-[9px] line-through">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock || inCart}
                      className={`w-full py-2 rounded-xl text-[9px] font-medium flex items-center justify-center gap-1 hover:scale-105 transition-all duration-300 shadow-sm ${
                        inCart
                          ? "bg-green-500 text-white"
                          : "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900 hover:bg-[#45a049] dark:hover:bg-[#4CAF50]"
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

        {/* Paginación compacta */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 animate-fadeIn">
            <button
              disabled={safePage === 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollToTop(); }}
              className="px-3 py-1.5 bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 text-[#2A2A2A] dark:text-white rounded-lg disabled:opacity-50 text-[10px] hover:scale-105 hover:bg-[#4CAF50] hover:text-white dark:hover:bg-[#66FF7A] dark:hover:text-gray-900 transition-all duration-300 disabled:hover:scale-100 disabled:hover:bg-[#F5F5F5] dark:disabled:hover:bg-gray-800 disabled:hover:text-[#2A2A2A] dark:disabled:hover:text-white"
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
                  className={`w-8 h-8 rounded-xl text-[10px] font-medium transition-all duration-300 hover:scale-110 ${
                    safePage === pageNum
                      ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900 shadow-md scale-105"
                      : "bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 text-[#2A2A2A] dark:text-white hover:border-[#4CAF50] dark:hover:border-[#66FF7A]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={safePage === totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); scrollToTop(); }}
              className="px-3 py-1.5 bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 text-[#2A2A2A] dark:text-white rounded-lg disabled:opacity-50 text-[10px] hover:scale-105 hover:bg-[#4CAF50] hover:text-white dark:hover:bg-[#66FF7A] dark:hover:text-gray-900 transition-all duration-300 disabled:hover:scale-100 disabled:hover:bg-[#F5F5F5] dark:disabled:hover:bg-gray-800 disabled:hover:text-[#2A2A2A] dark:disabled:hover:text-white"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* CSS Animations for futuristic effects */}
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

export default ShopSection;