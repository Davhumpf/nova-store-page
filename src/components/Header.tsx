// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Menu,
  X,
  LogOut,
  User,
  Award,
  Settings,
  Shield,
  UserCheck,
  Instagram,
  MessageCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

const Header: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, userProfile } = useUser();
  const { theme, toggleTheme, effectiveTheme } = useTheme();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // ====== Cargar rol del usuario (según colección "roles") ======
  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async () => {
      try {
        if (!user?.email) {
          if (mounted) setUserRole(null);
          return;
        }

        const emailLower = user.email.toLowerCase();

        // Super admin directo por correo
        if (emailLower === 'scpu.v1@gmail.com') {
          if (mounted) setUserRole('super_admin');
          return;
        }

        // Query de roles por email (normalizado en minúsculas)
        const rolesRef = collection(db, 'roles');
        const q = query(rolesRef, where('email', '==', emailLower), limit(1));
        const snap = await getDocs(q);

        if (!mounted) return;

        if (!snap.empty) {
          const data = snap.docs[0].data() as any;
          const active = data?.isActive !== false;
          const role = active ? (data?.role || 'user') : 'user';
          setUserRole(role);
        } else {
          setUserRole('user');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        if (mounted) setUserRole('user');
      }
    };

    fetchUserRole();
    return () => { mounted = false; };
  }, [user]);

  // ====== Efecto de scroll ======
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ====== Cerrar dropdown (desktop) al hacer click fuera ======
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  // ====== Acciones ======
  const toggleCart = () => setIsCartOpen(true);

  const toggleMobileMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMobileMenuOpen(v => !v);
    setShowUserMenu(false);
  };

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(v => !v);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const openInstagram = () =>
    window.open('https://www.instagram.com/novastore_streaming?igsh=MWswdWt6MmIzZWswbQ==', '_blank');
  const openWhatsApp = () => window.open('https://wa.me/573027214125', '_blank');
  const goHome = () => navigate('/');

  // ====== Opciones por rol (desktop + móvil) ======
  const renderUserMenuOptions = () => {
    const base = [
      { href: '/profile', icon: <User size={16} />, label: 'Perfil', color: 'hover:text-[#4CAF50] dark:hover:text-[#66FF7A]' },
      { href: '/settings', icon: <Settings size={16} />, label: 'Configuración', color: 'hover:text-[#4CAF50] dark:hover:text-[#66FF7A]' }
    ];

    const extras: { href: string; icon: JSX.Element; label: string; color: string }[] = [];

    if (userRole === 'super_admin') {
      extras.push({ href: '/AdminDashboard', icon: <Shield size={16} />, label: 'Panel Admin', color: 'hover:text-[#4CAF50] dark:hover:text-[#66FF7A]' });
    } else if (userRole === 'admin') {
      extras.push({ href: '/AdminDashboard', icon: <UserCheck size={16} />, label: 'Panel Admin', color: 'hover:text-[#4FC3F7] dark:hover:text-[#81D4FA]' });
    } else if (userRole === 'collaborator') {
      extras.push({ href: '/collaborations', icon: <UserCheck size={16} />, label: 'Herramientas', color: 'hover:text-[#BA68C8] dark:hover:text-[#CE93D8]' });
    }

    return [...base, ...extras];
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 comic-border-light halftone-pattern ${
        isScrolled
          ? 'bg-pop-yellow dark:bg-pop-purple backdrop-blur-sm shadow-lg speed-lines'
          : 'bg-pop-cyan dark:bg-pop-blue'
      } border-b-4 border-black dark:border-white`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center">
          <div className="relative">
            <div className="relative bg-white dark:bg-gray-800 comic-border stipple-pattern rounded-full px-6 md:px-8 py-3 flex items-center gap-3 md:gap-5">
              
              {/* Logo / Título en burbuja con sombra */}
              <button
                onClick={goHome}
                className="text-xl font-bold text-black dark:text-white whitespace-nowrap transition-all duration-200 bg-pop-pink dark:bg-pop-orange px-5 py-2 rounded-full comic-border-light comic-text-shadow hover:animate-comic-pop uppercase tracking-wide"
              >
                Nova Store
              </button>

              {/* Separador */}
              <div className="w-1 h-6 bg-black dark:bg-white" />

              {/* 🌙 BOTÓN DE TEMA (SOL/LUNA/MONITOR) - Three Modes */}
              <button
                onClick={toggleTheme}
                className="comic-button text-black dark:text-white p-2 rounded-md transition-all duration-200 hover:animate-comic-bounce"
                aria-label="Cambiar tema"
                title={
                  theme === 'light'
                    ? 'Modo: Claro (click para oscuro)'
                    : theme === 'dark'
                    ? 'Modo: Oscuro (click para sistema)'
                    : 'Modo: Sistema (click para claro)'
                }
              >
                {theme === 'light' ? (
                  <Sun size={18} className="md:w-[20px] md:h-[20px]" />
                ) : theme === 'dark' ? (
                  <Moon size={18} className="md:w-[20px] md:h-[20px]" />
                ) : (
                  <Monitor size={18} className="md:w-[20px] md:h-[20px]" />
                )}
              </button>

              <div className="w-1 h-6 bg-black dark:bg-white" />

              {/* Redes */}
              <div className="flex items-center gap-1">
                <button
                  onClick={openWhatsApp}
                  className="text-pop-green dark:text-pop-green-dark comic-hover bg-white dark:bg-gray-700 p-2 rounded-md transition-all duration-200 comic-border-light"
                  aria-label="WhatsApp"
                  title="Contáctanos por WhatsApp"
                >
                  <MessageCircle size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
                <button
                  onClick={openInstagram}
                  className="text-pop-purple dark:text-pop-purple-dark comic-hover bg-white dark:bg-gray-700 p-2 rounded-md transition-all duration-200 comic-border-light"
                  aria-label="Instagram"
                  title="Síguenos en Instagram"
                >
                  <Instagram size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>

              <div className="w-1 h-6 bg-black dark:bg-white" />

              {/* Acciones principales */}
              <div className="flex items-center gap-1">
                {/* Carrito */}
                <button
                  className="relative text-black dark:text-white comic-hover bg-white dark:bg-gray-700 p-2 rounded-md transition-all duration-200 comic-border-light"
                  onClick={toggleCart}
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pop-red dark:bg-pop-red-dark text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center comic-border-light animate-comic-pop">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>

                {/* Hamburguesa móvil */}
                <button
                  onClick={toggleMobileMenu}
                  className="text-black dark:text-white comic-hover bg-white dark:bg-gray-700 p-2 rounded-md transition-all duration-200 comic-border-light md:hidden"
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {/* Hamburguesa desktop */}
                <button
                  onClick={toggleUserMenu}
                  className="hidden md:block text-black dark:text-white comic-hover bg-white dark:bg-gray-700 p-2 rounded-md transition-all duration-200 comic-border-light"
                >
                  <Menu size={18} />
                </button>
              </div>
            </div>

            {/* Dropdown usuario (Desktop) */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-3 w-64 comic-panel halftone-pattern rounded-lg overflow-hidden z-50 animate-comic-pop"
                onClick={(e) => e.stopPropagation()}
              >
                {user ? (
                  <>
                    <div className="flex flex-col items-center px-6 py-5 border-b-4 border-black dark:border-white bg-pop-yellow dark:bg-pop-purple stipple-pattern">
                      <div className="mb-3">
                        <div className="w-14 h-14 rounded-full bg-pop-green dark:bg-pop-cyan flex items-center justify-center comic-border-light">
                          <User size={24} className="text-black dark:text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-black dark:text-white truncate max-w-full comic-text-shadow">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-md comic-border-light">
                        <Award size={14} className="text-pop-orange dark:text-pop-orange-dark" />
                        <span className="text-black dark:text-white text-sm font-bold">
                          {userProfile?.points ?? 0} pts
                        </span>
                      </div>
                      {userRole && userRole !== 'user' && (
                        <div className="mt-2 bg-pop-pink dark:bg-pop-pink-dark px-4 py-1.5 rounded-md comic-border-light">
                          <span className="text-black dark:text-white text-xs font-bold uppercase">
                            {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                          </span>
                        </div>
                      )}
                    </div>

                    {renderUserMenuOptions().map((option, index) => (
                      <Link
                        key={index}
                        to={option.href}
                        className="w-full text-left px-6 py-4 text-black dark:text-white hover:bg-pop-cyan dark:hover:bg-pop-blue flex items-center gap-3 text-sm transition-all duration-200 comic-hover font-bold border-b-2 border-black/20 dark:border-white/20"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {option.icon}
                        <span className="font-bold">{option.label}</span>
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-4 text-white bg-pop-red dark:bg-pop-red-dark flex items-center gap-3 text-sm transition-all duration-200 comic-hover font-bold border-t-4 border-black dark:border-white"
                    >
                      <LogOut size={16} />
                      <span className="font-bold">Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <div className="p-6">
                    <Link
                      to="/auth"
                      className="comic-button w-full block text-center rounded-md px-4 py-3 text-sm transition-all duration-200 hover:animate-comic-bounce"
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

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden bg-white dark:bg-gray-800 halftone-pattern border-t-4 border-black dark:border-white shadow-lg animate-slideDown"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {user ? (
              <div className="flex flex-col items-center gap-4 mt-2 py-6 border-t-4 border-black dark:border-white bg-pop-yellow dark:bg-pop-purple stipple-pattern rounded-lg comic-border-light">
                <div className="mb-2">
                  <div className="w-16 h-16 rounded-full bg-pop-green dark:bg-pop-cyan flex items-center justify-center comic-border-light">
                    <User size={28} className="text-black dark:text-white" />
                  </div>
                </div>
                <span className="text-black dark:text-white font-bold truncate max-w-[200px] text-sm comic-text-shadow">{user.email}</span>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-md comic-border-light">
                  <Award size={16} className="text-pop-orange dark:text-pop-orange-dark" />
                  <span className="text-black dark:text-white text-sm font-bold">
                    {userProfile?.points ?? 0} pts
                  </span>
                </div>
                {userRole && userRole !== 'user' && (
                  <div className="bg-pop-pink dark:bg-pop-pink-dark px-3 py-1.5 rounded-md comic-border-light">
                    <span className="text-black dark:text-white text-xs font-bold uppercase">
                      {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                    </span>
                  </div>
                )}

                {/* Redes (móvil) */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={openWhatsApp}
                    className="bg-pop-green dark:bg-pop-green-dark text-black dark:text-white rounded-md p-3 transition-all duration-200 flex items-center gap-2 comic-hover comic-border-light"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={16} />
                    <span className="text-xs font-bold">WhatsApp</span>
                  </button>
                  <button
                    onClick={openInstagram}
                    className="bg-pop-purple dark:bg-pop-purple-dark text-white dark:text-black rounded-md p-3 transition-all duration-200 flex items-center gap-2 comic-hover comic-border-light"
                    aria-label="Instagram"
                  >
                    <Instagram size={16} />
                    <span className="text-xs font-bold">Instagram</span>
                  </button>
                </div>

                <div className="w-full space-y-3 mt-4">
                  {renderUserMenuOptions().map((option, index) => (
                    <Link
                      key={index}
                      to={option.href}
                      className="w-full bg-white dark:bg-gray-700 text-black dark:text-white rounded-md py-3 px-5 flex items-center justify-center gap-3 hover:bg-pop-cyan dark:hover:bg-pop-blue text-sm transition-all duration-200 comic-hover comic-border-light"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {option.icon}
                      <span className="font-bold">{option.label}</span>
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="w-full bg-pop-red dark:bg-pop-red-dark text-white rounded-md py-3 px-5 flex items-center justify-center gap-3 text-sm transition-all duration-200 comic-hover comic-border-light"
                  >
                    <LogOut size={18} />
                    <span className="font-bold">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 py-6 border-t-4 border-black dark:border-white">
                <Link
                  to="/auth"
                  className="comic-button w-full block text-center rounded-md px-6 py-4 transition-all duration-200 hover:animate-comic-bounce"
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