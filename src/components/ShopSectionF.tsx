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
      <div className="min-h-screen bg-[#E8E8E8] dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#4CAF50]/30 border-t-[#4CAF50] dark:border-[#66FF7A]/30 dark:border-t-[#66FF7A] animate-spin mb-2"></div>
            <p className="text-[#5A5A5A] dark:text-gray-400 text-xs font-light">Cargando contenido...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-[#E8E8E8] dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="text-center bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 p-4 rounded-lg">
            <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8] dark:bg-gray-900">
      <Header />

      {/* Barra de controles superior */}
      <div className="bg-[#F5F5F5] dark:bg-gray-800 border-b border-[#D0D0D0] dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[10px] text-[#4CAF50] dark:text-[#66FF7A] hover:text-[#45a049] dark:hover:text-[#4CAF50] transition-colors group"
            >
              <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium">Volver</span>
            </button>
            <p className="text-[#8A8A8A] dark:text-gray-400 text-[9px] font-light">{filtered.length} productos</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 px-2 py-1.5 rounded-md">
              <Search size={12} className="text-[#8A8A8A] dark:text-gray-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                  scrollToTop();
                }}
                className="bg-transparent outline-none text-[#2A2A2A] dark:text-white flex-1 placeholder-[#8A8A8A] dark:placeholder-gray-400 text-[10px]"
              />
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`p-1.5 rounded-md transition-all shrink-0 ${
                showFilters ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900" : "bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 text-[#8A8A8A] dark:text-gray-400"
              }`}
              title="Filtros"
            >
              <Filter size={12} />
            </button>

            <div className="flex bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 rounded-md p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded transition-all ${
                  viewMode === "grid" ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900" : "text-[#8A8A8A] dark:text-gray-400"
                }`}
                title="Vista grid"
              >
                <Grid size={10} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded transition-all ${
                  viewMode === "list" ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900" : "text-[#8A8A8A] dark:text-gray-400"
                }`}
                title="Vista lista"
              >
                <List size={10} />
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-700 rounded-md border border-[#D0D0D0] dark:border-gray-600 p-3 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-[#2A2A2A] dark:text-white">Filtros</span>
                <button onClick={() => setShowFilters(false)} className="text-[#8A8A8A] dark:text-gray-400">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Categoría */}
                <div>
                  <label className="block text-[9px] text-[#8A8A8A] dark:text-gray-400 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                      scrollToTop();
                    }}
                    className="w-full bg-[#F5F5F5] dark:bg-gray-600 border border-[#D0D0D0] dark:border-gray-500 text-[#2A2A2A] dark:text-white px-2 py-1 rounded-md text-[10px]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "all" ? "Todas" : c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ordenar */}
                <div>
                  <label className="block text-[9px] text-[#8A8A8A] dark:text-gray-400 mb-1">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); scrollToTop(); }}
                    className="w-full bg-[#F5F5F5] dark:bg-gray-600 border border-[#D0D0D0] dark:border-gray-500 text-[#2A2A2A] dark:text-white px-2 py-1 rounded-md text-[10px]"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="price-low">Precio menor</option>
                    <option value="price-high">Precio mayor</option>
                    <option value="rating">Mejor valorados</option>
                    <option value="popular">Más populares</option>
                  </select>
                </div>

                {/* Precio máx */}
                <div className="col-span-2">
                  <label className="block text-[9px] text-[#8A8A8A] dark:text-gray-400 mb-1">
                    Precio máximo: ${priceRange[1].toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50}
                    value={priceRange[1]}
                    onChange={(e) => {
                      setPriceRange([0, Number(e.target.value)]);
                      setPage(1);
                      scrollToTop();
                    }}
                    className="w-full accent-[#4CAF50] dark:accent-[#66FF7A] h-1"
                  />
                </div>

                {/* Rating */}
                <div className="col-span-2">
                  <label className="block text-[9px] text-[#8A8A8A] dark:text-gray-400 mb-1">Rating mínimo</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setMinRating(rating === minRating ? 0 : rating);
                          setPage(1);
                          scrollToTop();
                        }}
                        className="transition-all"
                        title={`${rating}+ estrellas`}
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
          )}
        </div>
      </div>

      <div ref={topRef} />

      {/* Contenido */}
      <div className="container mx-auto px-3 py-3">
        {paginated.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 rounded-lg p-6 max-w-sm mx-auto">
              <Play size={24} className="text-[#D0D0D0] dark:text-gray-600 mx-auto mb-2" />
              <p className="text-[#5A5A5A] dark:text-gray-400 text-xs font-light">No hay contenido disponible</p>
            </div>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "space-y-2"}>
            {paginated.map((product) => {
              const inCart = cartItems.some((it) => it.id === product.id);
              return (
                <div
                  key={product.id}
                  className={`group bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 rounded-md hover:shadow-md transition-all ${
                    viewMode === "list" ? "flex gap-2 p-2" : "overflow-hidden"
                  }`}
                >
                  {/* Imagen */}
                  <div className={`relative ${viewMode === "list" ? "w-20 h-20 shrink-0" : "w-full aspect-square"}`}>
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded">
                        -{product.discount}%
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-gray-900/80 rounded backdrop-blur-sm"
                      title="Favorito"
                    >
                      <Heart
                        size={10}
                        className={favorites.includes(product.id) ? "text-red-500 fill-current" : "text-[#8A8A8A] dark:text-gray-400"}
                      />
                    </button>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock || inCart}
                          className="p-1.5 bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                          title={inCart ? "Ya en carrito" : "Añadir al carrito"}
                        >
                          <ShoppingCart size={12} />
                        </button>
                        <Link to={`/product-f/${product.id}`} className="p-1.5 bg-white dark:bg-gray-700 text-[#2A2A2A] dark:text-white rounded-full" title="Detalles">
                          <Eye size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={viewMode === "list" ? "flex-1 min-w-0" : "p-2"}>
                    <div className="flex items-start gap-1 mb-1">
                      <h3 className="text-[#2A2A2A] dark:text-white font-medium text-[10px] line-clamp-2 flex-1">{product.name}</h3>
                      {!product.inStock && (
                        <span className="bg-red-500/20 text-red-500 dark:text-red-400 text-[8px] px-1 py-0.5 rounded-full">No disponible</span>
                      )}
                    </div>

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
                      <div>
                        {product.originalPrice > product.price && (
                          <span className="text-[#8A8A8A] dark:text-gray-400 text-[8px] line-through mr-1">
                            ${product.originalPrice.toLocaleString("es-CO")}
                          </span>
                        )}
                        <span className="text-[#4CAF50] dark:text-[#66FF7A] font-bold text-xs">
                          ${product.price.toLocaleString("es-CO")}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Link
                          to={`/product-f/${product.id}`}
                          className="bg-white dark:bg-gray-700 border border-[#D0D0D0] dark:border-gray-600 text-[#2A2A2A] dark:text-white px-2 py-1 rounded text-[9px] hover:bg-[#FAFAFA] dark:hover:bg-gray-600"
                        >
                          Ver
                        </Link>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock || inCart}
                          className={`px-2 py-1 rounded text-[9px] font-medium flex items-center gap-0.5 ${
                            inCart
                              ? "bg-green-500 text-white"
                              : product.inStock
                              ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900 hover:bg-[#45a049] dark:hover:bg-[#4CAF50]"
                              : "bg-[#D0D0D0] dark:bg-gray-600 text-[#8A8A8A] dark:text-gray-500 cursor-not-allowed"
                          } disabled:opacity-50`}
                        >
                          <ShoppingCart size={9} />
                          {inCart ? "En carrito" : "Añadir"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-4">
            <button
              disabled={safePage === 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollToTop(); }}
              className="px-2 py-1 bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 text-[#2A2A2A] dark:text-white rounded disabled:opacity-50 text-[10px]"
            >
              Anterior
            </button>

            <div className="flex gap-1">
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
                        ? "bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900"
                        : "bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 text-[#2A2A2A] dark:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={safePage === totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); scrollToTop(); }}
              className="px-2 py-1 bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 text-[#2A2A2A] dark:text-white rounded disabled:opacity-50 text-[10px]"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopSectionF;