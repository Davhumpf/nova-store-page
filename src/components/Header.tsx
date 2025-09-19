// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, LogOut, User, Award, Settings, Shield, UserCheck, Instagram, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from 'firebase/firestore';

// Nueva prop para controlar la visibilidad del título
interface HeaderProps {
  showHeaderTitle?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showHeaderTitle = true }) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Cargar rol del usuario - SIN CAMBIOS
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

  // Lógica de scroll - SIN CAMBIOS
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al hacer click fuera - SIN CAMBIOS
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  // Todas las funciones - SIN CAMBIOS
  const toggleCart = () => setIsCartOpen(true);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  const openInstagram = () => {
    window.open('https://www.instagram.com/novastore_streaming?igsh=MWswdWt6MmIzZWswbQ==', '_blank');
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/573027214125', '_blank');
  };

  const goHome = () => {
    navigate('/');
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
        label: "Configuración",
        color: "hover:text-yellow-400"
      }
    ];

    const adminOptions = [];
    
    if (userRole === 'super_admin') {
      adminOptions.push({
        href: "/AdminDashboard",
        icon: <Shield size={16} />,
        label: "Panel Admin",
        color: "hover:text-green-400"
      });
    } else if (userRole === 'admin') {
      adminOptions.push({
        href: "/AdminDashboard",
        icon: <UserCheck size={16} />,
        label: "Panel Admin",
        color: "hover:text-blue-400"
      });
    } else if (userRole === 'collaborator') {
      adminOptions.push({
        href: "/collaborations",
        icon: <UserCheck size={16} />,
        label: "Colaboraciones",
        color: "hover:text-purple-400"
      });
    }

    return [...baseOptions, ...adminOptions];
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-900/95 backdrop-blur-sm shadow-xl'
          : 'bg-slate-900'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center">
          <div className="relative">
            <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-full px-4 md:px-6 py-3 shadow-lg flex items-center gap-2 md:gap-4">
              
              {/* Logo/Punto - ANIMACIÓN MORFOSIS: Punto que se desarma en letras */}
              <div className="flex-shrink-0 overflow-hidden">
                <div className="relative flex items-center justify-center min-w-[20px] h-[28px]">
                  
                  {/* Contenedor para el punto y texto con máscara de clip */}
                  <div className="relative">
                    
                    {/* Punto amarillo - se expande como líquido */}
                    <div 
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 transition-all duration-1000 ease-in-out ${
                        showHeaderTitle 
                          ? 'rounded-full w-0 h-0 opacity-0 scale-0' 
                          : 'rounded-full w-3 h-3 opacity-100 scale-100'
                      }`}
                    >
                      <div className={`w-full h-full bg-yellow-400 rounded-full ${!showHeaderTitle ? 'animate-pulse' : ''}`}></div>
                    </div>
                    
                    {/* Texto Nova Store - aparece desde la "explosión" del punto */}
                    <button
                      onClick={goHome}
                      className={`relative text-lg font-bold text-yellow-400 hover:text-yellow-300 whitespace-nowrap transition-all duration-900 ease-out ${
                        showHeaderTitle 
                          ? 'opacity-100 scale-100 filter-none tracking-normal' 
                          : 'opacity-0 scale-50 blur-md tracking-widest'
                      }`}
                      style={{
                        textShadow: showHeaderTitle ? 'none' : '0 0 10px rgba(250, 204, 21, 0.5)',
                        transform: showHeaderTitle 
                          ? 'translateY(0px) rotateX(0deg)' 
                          : 'translateY(2px) rotateX(15deg)'
                      }}
                    >
                      <span className={`inline-block transition-all duration-1000 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        N
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-75 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        o
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-150 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        v
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-225 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        a
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-300 mx-1 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        {" "}
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-375 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        S
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-450 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        t
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-525 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        o
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-600 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        r
                      </span>
                      <span className={`inline-block transition-all duration-1000 delay-675 ${showHeaderTitle ? 'transform-none' : 'scale-75'}`}>
                        e
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Separador - Siempre visible */}
              <div className="w-px h-6 bg-slate-600"></div>

              {/* Redes sociales - REVERTIDO: Sin margin dinámico */}
              <div className="flex items-center gap-1">
                <button
                  onClick={openWhatsApp}
                  className="text-green-400 hover:text-green-300 p-1.5 md:p-2 hover:bg-slate-700/50 rounded-full transition-all duration-200"
                  aria-label="WhatsApp"
                  title="Contactanos por WhatsApp"
                >
                  <MessageCircle size={16} className="md:w-[18px] md:h-[18px]" />
                </button>

                <button
                  onClick={openInstagram}
                  className="text-pink-400 hover:text-pink-300 p-1.5 md:p-2 hover:bg-slate-700/50 rounded-full transition-all duration-200"
                  aria-label="Instagram"
                  title="Síguenos en Instagram"
                >
                  <Instagram size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>

              <div className="w-px h-6 bg-slate-600"></div>

              {/* Botones principales - SIN CAMBIOS */}
              <div className="flex items-center gap-1">
                {/* Carrito */}
                <button
                  className="relative text-yellow-400 hover:text-yellow-300 p-1.5 md:p-2 hover:bg-slate-700/50 rounded-full transition-all duration-200"
                  onClick={toggleCart}
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
                
                {/* Menú hamburguesa móvil */}
                <button
                  onClick={isMobileMenuOpen ? () => setIsMobileMenuOpen(false) : toggleUserMenu}
                  className="text-yellow-400 hover:text-yellow-300 p-1.5 hover:bg-slate-700/50 rounded-full transition-all duration-200 md:hidden"
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {/* Menú hamburguesa desktop */}
                <button
                  onClick={toggleUserMenu}
                  className="hidden md:block text-yellow-400 hover:text-yellow-300 p-2 hover:bg-slate-700/50 rounded-full transition-all duration-200"
                >
                  <Menu size={18} />
                </button>
              </div>
            </div>

            {/* Dropdown menú usuario - Desktop - SIN CAMBIOS */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-4 w-64 bg-slate-800/95 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden z-50 border border-slate-700/50">
                {user ? (
                  <>
                    <div className="flex flex-col items-center px-6 py-5 border-b border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="mb-3">
                        <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center border-2 border-yellow-400/50">
                          <User size={24} className="text-yellow-400" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-yellow-400 truncate max-w-full">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2 bg-slate-700/50 px-4 py-2 rounded-full border border-slate-600/50">
                        <Award size={14} className="text-yellow-400" />
                        <span className="text-white text-sm font-semibold">
                          {user?.points || 0} pts
                        </span>
                      </div>
                      {userRole && userRole !== 'user' && (
                        <div className="mt-2 bg-purple-500/20 px-4 py-1.5 rounded-full border border-purple-400/30">
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
                        className={`w-full text-left px-6 py-4 text-white hover:bg-slate-700/50 flex items-center gap-3 ${option.color} text-sm transition-all duration-200`}
                        onClick={() => setShowUserMenu(false)}
                      >
                        {option.icon}
                        <span className="font-medium">{option.label}</span>
                      </Link>
                    ))}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-4 text-white hover:bg-slate-700/50 flex items-center gap-3 hover:text-red-400 text-sm border-t border-slate-700/50 transition-all duration-200"
                    >
                      <LogOut size={16} />
                      <span className="font-medium">Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <div className="p-6">
                    <Link 
                      to="/auth" 
                      className="w-full block text-center bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Iniciar sesión
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Menú móvil - SIN CAMBIOS */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 shadow-xl">
          <div className="p-6">
            {user ? (
              <div className="flex flex-col items-center gap-4 mt-2 py-6 border-t border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl">
                <div className="mb-2">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center border-2 border-yellow-400/50">
                    <User size={28} className="text-yellow-400" />
                  </div>
                </div>
                <span className="text-white font-medium truncate max-w-[200px] text-sm">{user.email}</span>
                <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-full border border-slate-600/50">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-white text-sm font-semibold">
                    {user?.points || 0} pts
                  </span>
                </div>
                {userRole && userRole !== 'user' && (
                  <div className="bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/30">
                    <span className="text-purple-300 text-xs font-semibold uppercase">
                      {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                    </span>
                  </div>
                )}
                
                {/* Botones de redes sociales destacados en móvil */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={openWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-3 transition-colors duration-200 flex items-center gap-2"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={16} />
                    <span className="text-xs font-semibold">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={openInstagram}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl p-3 transition-all duration-200 flex items-center gap-2"
                    aria-label="Instagram"
                  >
                    <Instagram size={16} />
                    <span className="text-xs font-semibold">Instagram</span>
                  </button>
                </div>
                
                <div className="w-full space-y-3 mt-4">
                  {renderUserMenuOptions().map((option, index) => (
                    <Link
                      key={index}
                      to={option.href}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl py-3 px-5 flex items-center justify-center gap-3 hover:border-yellow-400/50 hover:text-yellow-400 text-sm transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {option.icon}
                      <span className="font-semibold">{option.label}</span>
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/80 hover:bg-red-500 text-white rounded-xl py-3 px-5 flex items-center justify-center gap-3 text-sm transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span className="font-semibold">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 py-6 border-t border-slate-700/50">
                <Link 
                  to="/auth" 
                  className="w-full block text-center bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl px-6 py-4 font-semibold transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
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
