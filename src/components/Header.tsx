import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, LogOut, User, Award, Search, Settings, Shield, UserCheck, Instagram, MessageCircle, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useSearch } from '../App';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from 'firebase/firestore';

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

const Header: React.FC<HeaderProps> = ({ onProductSelect }) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user } = useUser();
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // SOLUCIÓN SIMPLE: Solo un estado para el input
  const [localSearch, setLocalSearch] = useState('');

  // CORREGIDO: Sincronizar input local con contexto global
  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);

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

      if (user.email === 'scpu.v1@gmail.com') {
        setUserRole('super_admin');
        return;
      }

      try {
        const rolesRef = collection(db, 'roles');
        const q = query(rolesRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const roleDoc = querySnapshot.docs[0];
          const roleData = roleDoc.data();
          
          if (roleData.isActive) {
            setUserRole(roleData.role || 'user');
          } else {
            setUserRole('user');
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
      if (showSocialMenu) {
        setShowSocialMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu, showResults, showSocialMenu]);

  const toggleCart = () => setIsCartOpen(true);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    setShowSocialMenu(false);
  };
  const toggleSearchBar = () => setShowSearchBar(!showSearchBar);
  const toggleSocialMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSocialMenu(!showSocialMenu);
    setShowUserMenu(false);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  const openInstagram = () => {
    window.open('https://www.instagram.com/novastore_streaming?igsh=MWswdWt6MmIzZWswbQ==', '_blank');
    setShowSocialMenu(false);
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/573027214125', '_blank');
    setShowSocialMenu(false);
  };

  // FUNCIÓN SIMPLE: Buscar mientras escribes (solo preview)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);

    // Preview en tiempo real
    if (value.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.description.toLowerCase().includes(value.toLowerCase()) ||
        product.category.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(filtered.length > 0);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // FUNCIÓN SIMPLE: Aplicar búsqueda (Enter o click en lupa)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(localSearch.trim());
    setShowResults(false);
    
    // Si hay búsqueda, navegar con parámetro
    if (localSearch.trim()) {
      navigate(`/?search=${encodeURIComponent(localSearch.trim())}`);
    } else {
      navigate('/');
    }
  };

  // FUNCIÓN SIMPLE: Limpiar todo completamente
  const clearEverything = () => {
    setLocalSearch('');
    setSearchResults([]);
    setShowResults(false);
    setSearchTerm('');
    navigate('/');
  };

  // FUNCIÓN SIMPLE: Solo limpiar input (botón X)
  const clearInput = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalSearch('');
    setSearchResults([]);
    setShowResults(false);
    setSearchTerm('');
    navigate('/');
  };

  const handleProductClick = (product: Product) => {
    setShowResults(false);
    
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
      <div className="container mx-auto px-4 py-3 flex justify-center">
        
        <div className="relative">
          <div className="relative bg-slate-800 border border-slate-700 rounded-full px-6 py-3 shadow-lg flex items-center gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={clearEverything}
                className="text-lg font-bold text-yellow-400 hover:text-yellow-300"
              >
                Nova Store
              </button>
            </div>

            <div className="w-px h-6 bg-slate-600"></div>

            {/* Barra de búsqueda integrada - Desktop */}
            <div className="hidden md:flex flex-1 min-w-0 max-w-sm relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={localSearch}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-full py-2 pl-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-300 p-1.5 hover:bg-slate-600 rounded-full transition-all duration-200"
                  title="Buscar"
                >
                  <Search size={14} />
                </button>
                {localSearch && (
                  <button
                    type="button"
                    onClick={clearInput}
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

            <div className="hidden md:block w-px h-6 bg-slate-600"></div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleSearchBar}
                className="md:hidden text-yellow-400 hover:text-yellow-300 p-2"
              >
                <Search size={18} />
              </button>

              {/* Botón de redes sociales agrupado */}
              <div className="relative">
                <button
                  onClick={toggleSocialMenu}
                  className="text-blue-400 hover:text-blue-300 p-2 transition-colors duration-200"
                  aria-label="Redes sociales"
                  title="Redes sociales"
                >
                  <Share2 size={18} />
                </button>

                {/* Dropdown de redes sociales */}
                {showSocialMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 shadow-xl rounded-2xl overflow-hidden z-50 border border-slate-700">
                    <button
                      onClick={openInstagram}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 flex items-center gap-3 hover:text-pink-400 text-sm"
                    >
                      <Instagram size={16} className="text-pink-400" />
                      <span className="font-medium">Instagram</span>
                    </button>
                    <button
                      onClick={openWhatsApp}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 flex items-center gap-3 hover:text-green-400 text-sm border-t border-slate-700"
                    >
                      <MessageCircle size={16} className="text-green-400" />
                      <span className="font-medium">WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>

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
              
              <button
                onClick={isMobileMenuOpen ? () => setIsMobileMenuOpen(false) : toggleUserMenu}
                className="text-yellow-400 hover:text-yellow-300 p-2 md:hidden"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

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
      </div>

      {/* Barra de búsqueda móvil */}
      {showSearchBar && (
        <div className="absolute top-full left-4 right-4 mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={localSearch}
              onChange={handleInputChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-5 pr-14 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-300 p-2 hover:bg-slate-600 rounded-full transition-all duration-200"
              title="Buscar"
            >
              <Search size={16} />
            </button>
            {localSearch && (
              <button
                type="button"
                onClick={clearInput}
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
                
                {/* Botones de redes sociales en móvil */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={openInstagram}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-3 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
                    aria-label="Síguenos en Instagram"
                  >
                    <Instagram size={16} />
                    <span className="text-xs font-semibold">Instagram</span>
                  </button>
                  
                  <button
                    onClick={openWhatsApp}
                    className="bg-green-500 text-white rounded-full p-3 hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                    aria-label="Contáctanos por WhatsApp"
                  >
                    <MessageCircle size={16} />
                    <span className="text-xs font-semibold">WhatsApp</span>
                  </button>
                </div>
                
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