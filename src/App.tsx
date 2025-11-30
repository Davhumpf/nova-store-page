// src/App.tsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Product } from "./types";
import Cart from "./components/Cart";
import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import ProductManagement from "./components/admin/ProductManagement";
import ProductManagementF from "./components/admin/ProductManagementF";
import Colaborators from "./components/admin/Colaborators";
import CouponsManagement from "./components/admin/CouponsManagement";
import Collaborations from "./components/Collaborations";
import CollaboratorProductCatalog from "./components/colab/CollaboratorProductCatalog";
import ProductsWithPagination from "./components/ProductsWithPagination";
import CheckoutPage from "./components/CheckoutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./auth/AuthPage";
import Login from "./auth/Login";
import Register from "./auth/Register";
import HomeWithSmartHeader from "./components/HomeWithSmartHeader";
import ShopSection from "./components/ShopSection";
import ShopSectionF from "./components/ShopSectionF";
import UserPage from "./components/hamburger/user";
import ConfigPage from "./components/hamburger/config";
import MainBanner from "./components/MainBanner";
import ProductDetail from "./components/ProductDetail";
import ProductDetailF from "./components/ProductDetailF";
import ExpressCatalog from "./components/colab/ExpressCatalog";

import { SearchProvider, useSearch } from "./context/SearchContext";
import { ThemeProvider } from "./context/ThemeContext"; // ⬅️ IMPORTAR

// -------------------- HomePage Legacy --------------------
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
  }, [location.search, setSearchTerm, searchTerm]);

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
      (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

  const handleCategoryChange = (category: string) => setSelectedCategory(category);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-2xl font-bold text-[#0D0D0D] dark:text-white">Cargando productos...</h3>
            <p className="text-[#595959] dark:text-gray-400">Estamos preparando todo para ti</p>
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
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-red-500">Error al cargar</h3>
            <p className="text-[#595959] dark:text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#0D0D0D] dark:bg-gray-700 text-[#4CAF50] dark:text-[#66FF7A] px-6 py-3 rounded-lg font-semibold hover:bg-[#262626] dark:hover:bg-gray-600 shadow-md transition-all duration-200"
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
      <MainBanner selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
      <ProductsWithPagination
        products={filteredProducts}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
    </>
  );
}

// -------------------- App --------------------
function App() {
  return (
    <ThemeProvider> {/* ⬅️ ENVOLVER TODO CON ThemeProvider */}
      <SearchProvider>
        <div className="min-h-screen bg-purple-50/30 dark:bg-[#0F0A1F] text-purple-950 dark:text-purple-50 transition-colors duration-150">
          <Routes>
            {/* Página principal */}
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<HomeWithSmartHeader />} />

            {/* Tiendas principales */}
            <Route path="/streaming" element={<ShopSection />} />
            <Route path="/fisicos" element={<ShopSectionF />} />

            {/* Rutas de compatibilidad */}
            <Route path="/tienda" element={<Navigate to="/streaming" replace />} />
            <Route path="/tienda-fisicos" element={<Navigate to="/fisicos" replace />} />

            {/* Página legacy */}
            <Route path="/legacy" element={<HomePage />} />

            {/* Detalles de productos */}
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product-f/:id" element={<ProductDetailF />} />

            {/* Checkout */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* Autenticación */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Administración */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/products-f" element={<ProductManagementF />} />
            <Route path="/admin/colaborators" element={<Colaborators />} />
            <Route path="/admin/coupons" element={<CouponsManagement />} />
            <Route path="/AdminDashboard" element={<Navigate to="/admin" replace />} />

            {/* Colaboradores */}
            <Route path="/collaborations" element={<Collaborations />} />
            <Route
              path="/collaborations/express"
              element={
                <ProtectedRoute>
                  <ExpressCatalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colab/collaborator-product-catalog"
              element={
                <ProtectedRoute>
                  <CollaboratorProductCatalog />
                </ProtectedRoute>
              }
            />
            {/* Aliases */}
            <Route path="/colab" element={<Navigate to="/collaborations" replace />} />
            <Route path="/colab/express" element={<Navigate to="/collaborations/express" replace />} />

            {/* Perfil y configuración */}
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

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/inicio" replace />} />
          </Routes>
          <Cart />
        </div>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;