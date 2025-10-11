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
      <div className="min-h-screen bg-[#E8E8E8]">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#4CAF50]/30 border-t-[#4CAF50] animate-spin mb-2"></div>
            <p className="text-[#5A5A5A] text-xs font-light">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E8E8E8]">
        <Header />
        <div className="flex items-center justify-center py-24 px-4">
          <div className="text-center bg-[#F5F5F5] border border-[#D0D0D0] p-4 rounded-lg">
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header />

      {/* Barra superior compacta */}
      <div className="bg-[#F5F5F5] border-b border-[#D0D0D0] sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 py-2">
          {/* Título y volver */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[10px] text-[#4CAF50] hover:text-[#45a049] transition-colors group"
            >
              <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium">Volver</span>
            </button>
            <p className="text-[#8A8A8A] text-[9px] font-light">{filtered.length} productos</p>
          </div>

          {/* Buscador y controles */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-white border border-[#D0D0D0] px-2 py-1.5 rounded-md">
              <Search size={12} className="text-[#8A8A8A] mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-[#2A2A2A] flex-1 placeholder-[#8A8A8A] text-[10px]"
              />
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`p-1.5 rounded-md transition-all shrink-0 ${
                showFilters ? "bg-[#4CAF50] text-white" : "bg-white border border-[#D0D0D0] text-[#8A8A8A]"
              }`}
              title="Filtros"
            >
              <Filter size={12} />
            </button>

            <div className="flex bg-white border border-[#D0D0D0] rounded-md p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded transition-all ${
                  viewMode === "grid" ? "bg-[#4CAF50] text-white" : "text-[#8A8A8A]"
                }`}
              >
                <Grid size={10} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded transition-all ${
                  viewMode === "list" ? "bg-[#4CAF50] text-white" : "text-[#8A8A8A]"
                }`}
              >
                <List size={10} />
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="bg-white rounded-md border border-[#D0D0D0] p-3 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-[#2A2A2A]">Filtros</span>
                <button onClick={() => setShowFilters(false)} className="text-[#8A8A8A]">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-[#8A8A8A] mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="w-full bg-[#F5F5F5] border border-[#D0D0D0] text-[#2A2A2A] px-2 py-1 rounded-md text-[10px]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "all" ? "Todas" : c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-[#8A8A8A] mb-1">Ordenar</label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="w-full bg-[#F5F5F5] border border-[#D0D0D0] text-[#2A2A2A] px-2 py-1 rounded-md text-[10px]"
                  >
                    <option value="newest">Nuevos</option>
                    <option value="price-low">Menor precio</option>
                    <option value="price-high">Mayor precio</option>
                    <option value="rating">Mejor valorados</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-[#8A8A8A] mb-1">
                    Precio máx: ${priceRange[1].toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50}
                    value={priceRange[1]}
                    onChange={(e) => { setPriceRange([0, Number(e.target.value)]); setPage(1); }}
                    className="w-full accent-[#4CAF50] h-1"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] text-[#8A8A8A] mb-1">Rating mínimo</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => { setMinRating(rating === minRating ? 0 : rating); setPage(1); }}
                        className="transition-all"
                      >
                        <Star
                          size={14}
                          className={
                            rating <= minRating
                              ? "text-[#FFB800] fill-current"
                              : "text-[#D0D0D0] hover:text-[#8A8A8A]"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={topRef} />

      {/* Contenido */}
      <div className="container mx-auto px-3 py-3">
        {paginated.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg p-6 max-w-sm mx-auto">
              <Play size={24} className="text-[#D0D0D0] mx-auto mb-2" />
              <p className="text-[#5A5A5A] text-xs font-light">No hay productos disponibles</p>
            </div>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
            : "space-y-2"}>
            {paginated.map((product) => {
              const inCart = cartItems.some((it) => it.id === product.id);
              const isFav = favorites.includes(product.id);

              if (viewMode === "list") {
                return (
                  <div key={product.id} className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-md p-2 flex gap-2 hover:shadow-sm transition-shadow">
                    <div className="relative w-20 h-20 shrink-0">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded">
                          -{product.discount}%
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-0 right-0 p-1 bg-white/80 rounded"
                      >
                        <Heart size={10} className={isFav ? "text-red-500 fill-current" : "text-[#8A8A8A]"} />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#2A2A2A] font-medium text-[10px] line-clamp-1 mb-0.5">{product.name}</h3>
                      <p className="text-[#8A8A8A] text-[9px] line-clamp-1 mb-1">{product.description}</p>

                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={8} className={i <= product.rating ? "text-[#FFB800] fill-current" : "text-[#D0D0D0]"} />
                          ))}
                        </div>
                        <span className="text-[#8A8A8A] text-[8px]">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#4CAF50] font-bold text-xs">
                          ${product.price.toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <Link
                            to={`/product/${product.id}`}
                            className="bg-white border border-[#D0D0D0] text-[#2A2A2A] px-2 py-1 rounded text-[9px] hover:bg-[#FAFAFA]"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock || inCart}
                            className={`px-2 py-1 rounded text-[9px] font-medium flex items-center gap-0.5 ${
                              inCart ? "bg-green-500 text-white" : "bg-[#4CAF50] text-white hover:bg-[#45a049]"
                            } disabled:opacity-50`}
                          >
                            <ShoppingCart size={9} />
                            {inCart ? "✓" : "+"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Vista Grid
              return (
                <div key={product.id} className="group bg-[#F5F5F5] border border-[#D0D0D0] rounded-md overflow-hidden hover:shadow-md transition-all">
                  <div className="relative aspect-square">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded">
                        -{product.discount}%
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-1 right-1 p-1 bg-white/80 rounded backdrop-blur-sm"
                    >
                      <Heart size={10} className={isFav ? "text-red-500 fill-current" : "text-[#8A8A8A]"} />
                    </button>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <Link to={`/product/${product.id}`} className="p-1.5 bg-white rounded-full">
                        <Eye size={12} className="text-[#2A2A2A]" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-2">
                    <h3 className="text-[#2A2A2A] font-medium text-[10px] line-clamp-2 mb-1 min-h-[28px]">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={8} className={i <= product.rating ? "text-[#FFB800] fill-current" : "text-[#D0D0D0]"} />
                        ))}
                      </div>
                      <span className="text-[#8A8A8A] text-[8px]">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#4CAF50] font-bold text-xs">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-[#8A8A8A] text-[9px] line-through">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock || inCart}
                      className={`w-full py-1.5 rounded text-[9px] font-medium flex items-center justify-center gap-1 transition-colors ${
                        inCart 
                          ? "bg-green-500 text-white" 
                          : "bg-[#4CAF50] text-white hover:bg-[#45a049]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ShoppingCart size={10} />
                      {inCart ? "En carrito" : "Añadir"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación compacta */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-4">
            <button
              disabled={safePage === 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollToTop(); }}
              className="px-2 py-1 bg-[#F5F5F5] border border-[#D0D0D0] text-[#2A2A2A] rounded disabled:opacity-50 text-[10px]"
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
                  className={`w-6 h-6 rounded text-[10px] font-medium ${
                    safePage === pageNum
                      ? "bg-[#4CAF50] text-white"
                      : "bg-[#F5F5F5] border border-[#D0D0D0] text-[#2A2A2A]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={safePage === totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); scrollToTop(); }}
              className="px-2 py-1 bg-[#F5F5F5] border border-[#D0D0D0] text-[#2A2A2A] rounded disabled:opacity-50 text-[10px]"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopSection;