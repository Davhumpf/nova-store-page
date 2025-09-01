// src/App.tsx

import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Product } from "./types";
import Header from "./components/Header";
import MainBanner from "./components/MainBanner";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import ChatBubble from "./components/ChatBubble";
import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import ProductManagement from "./components/admin/ProductManagement";
import Colaborators from "./components/admin/Colaborators";
import ProfilePage from "./components/ProfilePage";
import Collaborations from "./components/Collaborations";
import ProductsWithPagination from "./components/ProductsWithPagination";
import CheckoutPage from "./components/CheckoutPage";
import ProtectedRoute from "./components/ProtectedRoute";
// Rutas corregidas para los componentes de autenticación
import AuthPage from "./auth/AuthPage";
import Login from "./auth/Login";
import Register from "./auth/Register";
// Importar utilidades de categorías
import { filterProductsByCategory, getCategoryDisplayName } from "./utils/categoryUtils";

// Contexto para compartir el estado de búsqueda
interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe usarse dentro de SearchProvider');
  }
  return context;
};

// --- HomePage ---
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { searchTerm, setSearchTerm } = useSearch();
  const query = useQuery();
  const navigate = useNavigate();
  const searchParam = query.get('search');

  // Cargar productos desde Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData: Product[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            name: data?.name || data?.title || '',
            description: data?.description || '',
            category: data?.category || 'general',
            price: data?.price || 0,
            originalPrice: data?.originalPrice || data?.price || 0,
            discount: data?.discount || 0,
            rating: data?.rating || 4.5,
            reviews: data?.reviews || data?.reviewCount || 0,
            imageUrl: data?.imageUrl || data?.image || '/default-product.jpg',
            longDescription: data?.longDescription || data?.description || '',
            duration: data?.duration || 'Permanente',
            devices: data?.devices || 'Todos los dispositivos',
            planType: data?.planType || 'Estándar',
            inStock: data?.inStock !== undefined ? data.inStock : true
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

  // Filtrar productos cuando cambian los productos o la categoría seleccionada
  useEffect(() => {
    if (products.length > 0) {
      const filtered = filterProductsByCategory(products, selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [products, selectedCategory]);

  // Manejar parámetro de búsqueda desde URL
  useEffect(() => {
    if (searchParam && searchParam !== searchTerm) {
      setSearchTerm(searchParam);
      const categoryFromSearch = getCategoryFromSearch(searchParam);
      if (categoryFromSearch) {
        setSelectedCategory(categoryFromSearch);
      }
    }
  }, [searchParam, searchTerm, setSearchTerm]);

  // Actualizar URL cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const params = new URLSearchParams();
      params.set('search', searchTerm);
      navigate(`/?${params.toString()}`, { replace: true });
    } else if (window.location.search) {
      navigate('/', { replace: true });
    }
  }, [searchTerm, navigate]);

  // Función mejorada para detectar categoría desde búsqueda
  function getCategoryFromSearch(searchTerm: string) {
    const lowerSearch = searchTerm.toLowerCase();
    
    // Video/Streaming
    if (lowerSearch.includes('video') || lowerSearch.includes('netflix') || 
        lowerSearch.includes('prime') || lowerSearch.includes('disney') ||
        lowerSearch.includes('hbo') || lowerSearch.includes('streaming')) {
      return 'video';
    }
    
    // Música
    if (lowerSearch.includes('música') || lowerSearch.includes('music') || 
        lowerSearch.includes('spotify') || lowerSearch.includes('apple music') ||
        lowerSearch.includes('tidal') || lowerSearch.includes('audio')) {
      return 'music';
    }
    
    // Gaming
    if (lowerSearch.includes('gaming') || lowerSearch.includes('games') || 
        lowerSearch.includes('game pass') || lowerSearch.includes('xbox') ||
        lowerSearch.includes('playstation') || lowerSearch.includes('steam')) {
      return 'gaming';
    }
    
    // Herramientas
    if (lowerSearch.includes('tools') || lowerSearch.includes('herramientas') || 
        lowerSearch.includes('canva') || lowerSearch.includes('adobe') ||
        lowerSearch.includes('capcut') || lowerSearch.includes('software')) {
      return 'tools';
    }
    
    // Educación
    if (lowerSearch.includes('education') || lowerSearch.includes('educación') || 
        lowerSearch.includes('duolingo') || lowerSearch.includes('courses') ||
        lowerSearch.includes('learning')) {
      return 'education';
    }
    
    // Productividad
    if (lowerSearch.includes('productivity') || lowerSearch.includes('productividad') || 
        lowerSearch.includes('office') || lowerSearch.includes('workspace') ||
        lowerSearch.includes('microsoft') || lowerSearch.includes('google')) {
      return 'productivity';
    }
    
    return null;
  }

  // Manejar cambio de categoría
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Limpiar búsqueda cuando se cambia de categoría
    if (searchTerm) {
      setSearchTerm('');
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-300">Cargando productos...</h3>
              <p className="text-slate-400">Estamos preparando todo para ti</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-red-400">Error al cargar</h3>
              <p className="text-slate-400">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
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
        products={searchTerm ? products : filteredProducts} 
        searchTerm={searchTerm} 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
    </>
  );
}

// Componente Provider para el contexto de búsqueda
function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

// --- App principal ---
function App() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Rutas de administración */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/colaborators" element={<Colaborators />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          {/* Ruta de colaboradores */}
          <Route path="/collaborations" element={<Collaborations />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
        <Cart />
        <ChatBubble />
      </div>
    </SearchProvider>
  );
}

export default App;