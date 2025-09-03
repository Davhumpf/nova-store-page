// src/App.tsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Product } from "./types";
import Header from "./components/Header";
import MainBanner from "./components/MainBanner";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import ProductManagement from "./components/admin/ProductManagement";
import Colaborators from "./components/admin/Colaborators";
import CouponsManagement from "./components/admin/CouponsManagement";
// import ProfilePage from "./components/ProfilePage"; // <- ya no se usa
import Collaborations from "./components/Collaborations";
import CollaboratorProductCatalog from "./components/colab/CollaboratorProductCatalog";
import ProductsWithPagination from "./components/ProductsWithPagination";
import CheckoutPage from "./components/CheckoutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./auth/AuthPage";
import Login from "./auth/Login";
import Register from "./auth/Register";

// nuevos
import UserPage from "./components/hamburger/user";
import ConfigPage from "./components/hamburger/config";

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
}
const SearchContext = createContext<SearchContextType | null>(null);
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch debe usarse dentro de SearchProvider");
  return context;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { searchTerm, setSearchTerm } = useSearch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramValue = params.get("search") || "";
    if (paramValue !== searchTerm) setSearchTerm(paramValue);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          productsData.push({
            id: doc.id,
            name: data?.name || data?.title || "",
            description: data?.description || "",
            category: data?.category || "general",
            price: data?.price || 0,
            originalPrice: data?.originalPrice || data?.price || 0,
            discount: data?.discount || 0,
            rating: data?.rating || 4.5,
            reviews: data?.reviews || data?.reviewCount || 0,
            imageUrl: data?.imageUrl || data?.image || "/default-product.jpg",
            longDescription: data?.longDescription || data?.description || "",
            duration: data?.duration || "Permanente",
            devices: data?.devices || "Todos los dispositivos",
            planType: data?.planType || "Estándar",
            inStock: data?.inStock !== undefined ? data.inStock : true,
          });
        });
        setProducts(productsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }
    const norm = (s: string) =>
      (s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const catKey = norm(selectedCategory);

    const filtered = products.filter((p) => {
      const pCat = norm(p.category);
      const catOk = catKey === "all" || pCat.includes(catKey);
      if (!catOk) return false;
      if (!searchTerm) return true;
      const q = norm(searchTerm);
      return (
        norm(p.name).includes(q) ||
        norm(p.description).includes(q) ||
        pCat.includes(q)
      );
    });
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-300">
                Cargando productos...
              </h3>
              <p className="text-slate-400">Estamos preparando todo para ti</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-red-400">
                Error al cargar
              </h3>
              <p className="text-slate-400">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <MainBanner
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      <ProductsWithPagination
        products={filteredProducts}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
    </>
  );
}

function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const clearSearch = () => {
    setSearchTerm("");
  };
  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

function App() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Administración */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/colaborators" element={<Colaborators />} />
          <Route path="/admin/coupons" element={<CouponsManagement />} />
          {/* Alias legacy */}
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          {/* Colaboradores */}
          <Route path="/collaborations" element={<Collaborations />} />
          <Route 
            path="/colab/collaborator-product-catalog" 
            element={
              <ProtectedRoute>
                <CollaboratorProductCatalog />
              </ProtectedRoute>
            } 
          />

          {/* PERFIL y CONFIG nuevos */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ConfigPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Cart />
      </div>
    </SearchProvider>
  );
}

export default App;