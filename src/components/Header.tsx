import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, LogOut, User, Award, Search, Settings, Shield, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  imageUrl?: string;
  image?: string;
}

interface HeaderProps {
  onSearch?: (searchTerm: string, results: Product[]) => void;
  onProductSelect?: (productId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onProductSelect }) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerms, setSearchTerms] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Cargar productos desde Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const productList: Product[] = [];
        snap.forEach(doc => {
          productList.push({ id: doc.id, ...(doc.data() as any) });
        });
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Cargar rol del usuario
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        return;
      }

      // Verificar si es el admin principal
      if (user.email === 'scpu.v1@gmail.com') {
        setUserRole('super_admin');
        return;
      }

      try {
        // Buscar en la colección de roles usando una query
        const rolesRef = collection(db, 'roles');
        const q = query(rolesRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Si encontramos el documento, obtener el primer resultado
          const roleDoc = querySnapshot.docs[0];
          const roleData = roleDoc.data();
          
          // Verificar si el rol está activo
          if (roleData.isActive) {
            setUserRole(roleData.role || 'user');
          } else {
            setUserRole('user'); // Si está inactivo, tratarlo como usuario normal
          }
        } else {
          setUserRole('user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
      if (showResults) {
        setShowResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu, showResults]);

  const toggleCart = () => setIsCartOpen(true);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };
  const toggleSearchBar = () => setShowSearchBar(!showSearchBar);
  
  const handleLogout = async () => {
    await signOut(auth);
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  // Función de búsqueda mejorada
  const performSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      if (onSearch) {
        onSearch('', []);
      }
      return;
    }

    const query = searchTerm.toLowerCase().trim();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );

    setSearchResults(filtered);
    setShowResults(filtered.length > 0);
    
    if (onSearch) {
      onSearch(searchTerm, filtered);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerms);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerms(value);
    performSearch(value);
  };

  const clearSearch = () => {
    setSearchTerms('');
    setSearchResults([]);
    setShowResults(false);
    if (onSearch) {
      onSearch('', []);
    }
  };

  const handleProductClick = (product: Product) => {
    setShowResults(false);
    setSearchTerms('');
    
    if (onProductSelect) {
      onProductSelect(product.id);
      return;
    }
    
    const productElement = document.getElementById(`product-${product.id}`);
    if (productElement) {
      productElement.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    window.location.href = `/product/${product.id}`;
  };

  const renderProductImage = (product: Product, size: 'small' | 'medium' = 'medium') => {
    const imageUrl = product.imageUrl || product.image;
    const sizeClasses = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
    const textSize = size === 'small' ? 'text-xs' : 'text-sm';
    
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={product.name}
          className={`${sizeClasses} rounded-lg object-cover border border-slate-600`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="${sizeClasses} bg-yellow-400 rounded-lg flex items-center justify-center">
                <span class="text-slate-900 ${textSize} font-bold">
                  ${product.name.charAt(0).toUpperCase()}
                </span>
              </div>
            `;
          }}
        />
      );
    }
    
    return (
      <div className={`${sizeClasses} bg-yellow-400 rounded-lg flex items-center justify-center`}>
        <span className={`text-slate-900 ${textSize} font-bold`}>
          {product.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  // Función para renderizar el menú de usuario basado en roles
  const renderUserMenuOptions = () => {
    const baseOptions = [
      {
        href: "/profile",
        icon: <User size={16} />,
        label: "Perfil",
        color: "hover:text-yellow-400"
      },
      {
        href: "/settings",
        icon: <Settings size={16} />,
        label: "Config",
        color: "hover:text-yellow-400"
      }
    ];

    const adminOptions = [];
    
    if (userRole === 'super_admin') {
      adminOptions.push({
        href: "/AdminDashboard",
        icon: <Shield size={16} />,
        label: "Admin",
        color: "hover:text-green-400"
      });
    } else if (userRole === 'admin') {
      adminOptions.push({
        href: "/AdminDashboard",
        icon: <UserCheck size={16} />,
        label: "Admin",
        color: "hover:text-blue-400"
      });
    } else if (userRole === 'collaborator') {
      adminOptions.push({
        href: "/collaborations",
        icon: <UserCheck size={16} />,
        label: "Colab",
        color: "hover:text-purple-400"
      });
    }

    return [...baseOptions, ...adminOptions];
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 ${
        isScrolled
          ? 'bg-slate-900 shadow-xl'
          : 'bg-slate-900'
      }`}
    >
      {/* Container principal */}
      <div className="container mx-auto px-4 py-3 flex justify-center">
        
        {/* Dynamic Island Style Container */}
        <div className="relative">
          {/* Main Dynamic Island Container */}
          <div className="relative bg-slate-800 border border-slate-700 rounded-full px-6 py-3 shadow-lg flex items-center gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-lg font-bold text-yellow-400 hover:text-yellow-300"
                onClick={clearSearch}
              >
                Nova Store
              </Link>
            </div>

            {/* Separador visual */}
            <div className="w-px h-6 bg-slate-600"></div>

            {/* Barra de búsqueda integrada - Desktop */}
            <div className="hidden md:flex flex-1 min-w-0 max-w-sm relative">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerms}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-full py-2 pl-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-300 p-1.5"
                >
                  <Search size={14} />
                </button>
                {searchTerms && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    <X size={12} />
                  </button>
                )}
              </form>

              {/* Resultados de búsqueda - Desktop */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl max-h-80 overflow-y-auto z-50 w-[600px]">
                  <div className="p-4">
                    <div className="text-yellow-400 text-xs font-semibold mb-4 px-2">
                      {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="flex items-center gap-4 p-3 hover:bg-slate-700 rounded-xl cursor-pointer border-b border-slate-700 last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          {renderProductImage(product, 'medium')}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm truncate hover:text-yellow-400">
                            {product.name}
                          </h4>
                          <p className="text-slate-400 text-xs mt-1 line-clamp-1">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-yellow-400 text-xs font-medium bg-yellow-400/15 px-3 py-1 rounded-full border border-yellow-400/25">
                              {product.category}
                            </span>
                            <span className="text-yellow-400 text-sm font-bold">
                              ${product.price}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                            <span className="text-slate-900 text-xs font-bold">→</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Separador visual para desktop */}
            <div className="hidden md:block w-px h-6 bg-slate-600"></div>

            {/* Controles integrados */}
            <div className="flex items-center gap-1">
              {/* Botón búsqueda móvil */}
              <button
                onClick={toggleSearchBar}
                className="md:hidden text-yellow-400 hover:text-yellow-300 p-2"
              >
                <Search size={18} />
              </button>

              {/* Carrito */}
              <button
                className="relative text-yellow-400 hover:text-yellow-300 p-2"
                onClick={toggleCart}
                aria-label="Carrito de compras"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Menú hamburguesa */}
              <button
                onClick={isMobileMenuOpen ? () => setIsMobileMenuOpen(false) : toggleUserMenu}
                className="text-yellow-400 hover:text-yellow-300 p-2 md:hidden"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Menú desktop */}
              <button
                onClick={toggleUserMenu}
                className="hidden md:block text-yellow-400 hover:text-yellow-300 p-2"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          {/* Dropdown hamburguesa - Desktop */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-4 w-64 bg-slate-800 shadow-xl rounded-3xl overflow-hidden z-50 border border-slate-700">
              {user ? (
                <>
                  <div className="flex flex-col items-center px-6 py-5 border-b border-slate-700 bg-slate-800">
                    <div className="mb-3">
                      <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center border-2 border-yellow-400">
                        <User size={24} className="text-yellow-400" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-yellow-400 truncate max-w-full">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2 bg-slate-700 px-4 py-2 rounded-full border border-slate-600">
                      <Award size={14} className="text-yellow-400" />
                      <span className="text-white text-sm font-semibold">
                        {user?.points || 0} pts
                      </span>
                    </div>
                    {userRole && userRole !== 'user' && (
                      <div className="mt-2 bg-purple-500/25 px-4 py-1.5 rounded-full border border-purple-400/25">
                        <span className="text-purple-300 text-xs font-semibold uppercase">
                          {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {renderUserMenuOptions().map((option, index) => (
                    <Link
                      key={index}
                      to={option.href}
                      className={`w-full text-left px-6 py-4 text-white hover:bg-slate-700 flex items-center gap-3 ${option.color} text-sm`}
                      onClick={() => setShowUserMenu(false)}
                    >
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-6 py-4 text-white hover:bg-slate-700 flex items-center gap-3 hover:text-red-400 text-sm border-t border-slate-700"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">Cerrar sesión</span>
                  </button>
                </>
              ) : (
                <div className="p-6">
                  <Link 
                    to="/auth" 
                    className="w-full block text-center bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-2xl px-4 py-3 font-semibold text-sm"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barra de búsqueda móvil */}
        {showSearchBar && (
          <div className="absolute top-full left-4 right-4 mt-3 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerms}
                onChange={handleSearchChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-5 pr-14 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-300 p-2"
              >
                <Search size={16} />
              </button>
              {searchTerms && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white p-1.5"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Resultados móvil */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl max-h-72 overflow-y-auto z-50">
                <div className="p-5">
                  <div className="text-yellow-400 text-xs font-semibold mb-4 px-1">
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center gap-4 p-4 hover:bg-slate-700 rounded-xl cursor-pointer border-b border-slate-700 last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        {renderProductImage(product, 'small')}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm truncate hover:text-yellow-400">
                          {product.name}
                        </h4>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-yellow-400 text-xs font-medium bg-yellow-400/15 px-3 py-1 rounded-full border border-yellow-400/25">
                            {product.category}
                          </span>
                          <span className="text-yellow-400 text-sm font-bold">
                            ${product.price}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-slate-900 text-xs font-bold">→</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 shadow-xl">
          <div className="p-6">
            {user ? (
              <div className="flex flex-col items-center gap-4 mt-2 py-6 border-t border-slate-700 bg-slate-800 rounded-2xl">
                <div className="mb-2">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center border-2 border-yellow-400">
                    <User size={28} className="text-yellow-400" />
                  </div>
                </div>
                <span className="text-white font-medium truncate max-w-[200px] text-sm">{user.email}</span>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-full border border-slate-600">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-white text-sm font-semibold">
                    {user?.points || 0} pts
                  </span>
                </div>
                {userRole && userRole !== 'user' && (
                  <div className="bg-purple-500/25 px-3 py-1.5 rounded-full border border-purple-400/30">
                    <span className="text-purple-300 text-xs font-semibold uppercase">
                      {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                    </span>
                  </div>
                )}
                
                <div className="w-full space-y-3 mt-3">
                  {renderUserMenuOptions().map((option, index) => (
                    <Link
                      key={index}
                      to={option.href}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-2xl py-3 px-5 flex items-center justify-center gap-3 hover:border-yellow-400 hover:text-yellow-400 text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {option.icon}
                      <span className="font-semibold">{option.label}</span>
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white rounded-2xl py-3 px-5 flex items-center justify-center gap-3 hover:bg-red-400 text-sm"
                  >
                    <LogOut size={18} />
                    <span className="font-semibold">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 py-6 border-t border-slate-700">
                <Link 
                  to="/auth" 
                  className="w-full block text-center bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-2xl px-6 py-4 font-semibold"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;