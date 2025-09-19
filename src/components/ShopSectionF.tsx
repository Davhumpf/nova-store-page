import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  Search, Star, Play, Filter, Grid, List, Heart, Eye, Users, ShoppingCart, ArrowLeft
} from "lucide-react";

// ✅ Header global
import Header from "./Header";
// ✅ Toasts (opcional; si no usas ToastProvider, puedes quitarlo)
import { useToast } from "./ToastProvider";
// ✅ Carrito global
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

  // Filtros (exactamente como la versión digital)
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1_000_000]);
  const [maxPrice, setMaxPrice] = useState(1_000_000);
  const [sortBy, setSortBy] = useState("newest");
  const [minRating, setMinRating] = useState(0);

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Navegación / carrito / toasts
  const navigate = useNavigate();
  const { push } = useToast();
  const { addToCart, cartItems } = useCart();

  // Cargar productos físicos (colección products-f)
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

  // Categorías únicas
  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))],
    [products]
  );

  // Filtrar y ordenar (idéntico a la versión digital)
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (p.rating < minRating) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(term) &&
          !p.description.toLowerCase().includes(term)
        ) {
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

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // Loading / Error con Header (igual que digital)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Cargando contenido...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // UI idéntica a ShopSection
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      {/* Barra de controles superior */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors mb-1"
              >
                <ArrowLeft size={16} />
                <span className="text-sm">Volver</span>
              </button>

              <h1 className="text-xl font-bold text-yellow-400 mb-1">Productos Físicos</h1>
              <p className="text-gray-400 text-sm">{filtered.length} productos encontrados</p>
            </div>

            {/* Buscador + view/filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center bg-gray-700 px-3 py-2 rounded-lg sm:w-64">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent outline-none text-white flex-1 placeholder-gray-400 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className={`p-2 rounded-lg transition-all ${
                    showFilters ? "bg-yellow-400 text-gray-900" : "bg-gray-700 text-gray-300"
                  }`}
                  title="Filtros"
                >
                  <Filter size={16} />
                </button>

                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === "grid" ? "bg-yellow-400 text-gray-900" : "text-gray-400"
                    }`}
                    title="Vista grid"
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === "list" ? "bg-yellow-400 text-gray-900" : "text-gray-400"
                    }`}
                    title="Vista lista"
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros desplegables (iguales) */}
          {showFilters && (
            <div className="bg-gray-800 rounded-lg p-4 mt-4 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 text-sm"
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
                  <label className="block text-sm text-gray-300 mb-1">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 text-sm"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="price-low">Precio menor</option>
                    <option value="price-high">Precio mayor</option>
                    <option value="rating">Mejor valorados</option>
                    <option value="popular">Más populares</option>
                  </select>
                </div>

                {/* Precio máx */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Precio máximo: ${priceRange[1]}
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
                    }}
                    className="w-full accent-yellow-400"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Rating mínimo</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setMinRating(rating === minRating ? 0 : rating);
                          setPage(1);
                        }}
                        className="transition-all"
                        title={`${rating}+ estrellas`}
                      >
                        <Star
                          size={16}
                          className={
                            rating <= minRating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600 hover:text-gray-400"
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

      {/* Contenido */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm">{filtered.length} productos encontrados</p>
          {totalPages > 1 && (
            <p className="text-gray-400 text-sm">
              Página {safePage} de {totalPages}
            </p>
          )}
        </div>

        {paginated.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
              <Play size={32} className="text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No hay contenido disponible</p>
              <p className="text-gray-500 text-sm">Ajusta tus filtros de búsqueda</p>
            </div>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-3"}>
            {paginated.map((product) => {
              const inCart = cartItems.some((it) => it.id === product.id);
              return (
                <div
                  key={product.id}
                  className={`group bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-400 transition-all ${
                    viewMode === "list" ? "flex gap-4 p-3" : "p-4"
                  }`}
                >
                  {/* Imagen */}
                  <div className={`relative ${viewMode === "list" ? "w-24 h-18" : "w-full h-40"} mb-3`}>
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                        -{product.discount}%
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-1 right-1 p-1.5 bg-gray-900/80 rounded backdrop-blur-sm"
                      title="Favorito"
                    >
                      <Heart
                        size={14}
                        className={favorites.includes(product.id) ? "text-red-500 fill-current" : "text-gray-400"}
                      />
                    </button>

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded flex items-center justify-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock || inCart}
                          className="p-2 bg-yellow-400 text-gray-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                          title={inCart ? "Ya en carrito" : "Añadir al carrito"}
                        >
                          <ShoppingCart size={14} />
                        </button>
                        <Link to={`/product-f/${product.id}`} className="p-2 bg-gray-800 text-white rounded-full" title="Detalles">
                          <Eye size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="text-white font-medium text-sm line-clamp-2 flex-1">{product.name}</h3>
                      {!product.inStock && (
                        <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">No disponible</span>
                      )}
                    </div>

                    <p className="text-gray-400 text-xs line-clamp-2 mb-2">{product.description}</p>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={12} className={i <= product.rating ? "text-yellow-400 fill-current" : "text-gray-600"} />
                        ))}
                      </div>
                      <span className="text-gray-400 text-xs">({product.reviews})</span>
                      <div className="flex items-center gap-1 text-gray-400 text-xs ml-1">
                        <Users size={10} />
                        <span>{Math.floor((product.reviews || 0) * 1.5)}+</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {product.originalPrice > product.price && (
                          <span className="text-gray-500 text-xs line-through mr-1">
                            ${product.originalPrice.toLocaleString("es-CO")}
                          </span>
                        )}
                        <span className="text-yellow-400 font-semibold text-lg">
                          ${product.price.toLocaleString("es-CO")}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Link
                          to={`/product-f/${product.id}`}
                          className="bg-gray-700 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-gray-600 transition-all border border-gray-600"
                        >
                          Ver
                        </Link>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock || inCart}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                            inCart
                              ? "bg-green-600 text-white cursor-default"
                              : product.inStock
                              ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                              : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingCart size={12} />
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
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-sm"
            >
              Anterior
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (safePage <= 3) pageNum = i + 1;
                else if (safePage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = safePage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                      safePage === pageNum
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-sm"
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
