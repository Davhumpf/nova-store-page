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
      { href: '/profile', icon: <User size={16} className="inking-icon" />, label: 'Perfil' },
      { href: '/settings', icon: <Settings size={16} className="inking-icon" />, label: 'Configuración' }
    ];

    const extras: { href: string; icon: JSX.Element; label: string }[] = [];

    if (userRole === 'super_admin') {
      extras.push({ href: '/AdminDashboard', icon: <Shield size={16} className="inking-icon" />, label: 'Panel Admin' });
    } else if (userRole === 'admin') {
      extras.push({ href: '/AdminDashboard', icon: <UserCheck size={16} className="inking-icon" />, label: 'Panel Admin' });
    } else if (userRole === 'collaborator') {
      extras.push({ href: '/collaborations', icon: <UserCheck size={16} className="inking-icon" />, label: 'Herramientas' });
    }

    return [...base, ...extras];
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 halftone-pattern ${
        isScrolled
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(255,255,255,0.08)]'
          : 'bg-white dark:bg-black'
      } border-b-2 border-black/10 dark:border-white/10`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center">
          <div className="relative">
            <div className="relative elegant-card stipple-pattern px-6 md:px-8 py-3 flex items-center gap-3 md:gap-5">
              
              {/* Logo / Título elegante */}
              <button
                onClick={goHome}
                className="text-xl font-bold elegant-text-primary whitespace-nowrap transition-all duration-300 bg-white dark:bg-black px-5 py-2 rounded-lg comic-border-light border-2 border-black dark:border-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_12px_rgba(255,255,255,0.12)] hover:transform hover:-translate-y-1 uppercase tracking-wide"
              >
                Nova Store
              </button>

              {/* Separador */}
              <div className="w-px h-6 bg-black/20 dark:bg-white/20" />

              {/* 🌙 BOTÓN DE TEMA (SOL/LUNA/MONITOR) - Three Modes */}
              <button
                onClick={toggleTheme}
                className="elegant-text-primary p-2 rounded-lg border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
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
                  <Sun size={18} className="md:w-[20px] md:h-[20px] inking-icon" />
                ) : theme === 'dark' ? (
                  <Moon size={18} className="md:w-[20px] md:h-[20px] inking-icon" />
                ) : (
                  <Monitor size={18} className="md:w-[20px] md:h-[20px] inking-icon" />
                )}
              </button>

              <div className="w-px h-6 bg-black/20 dark:bg-white/20" />

              {/* Redes */}
              <div className="flex items-center gap-1">
                <button
                  onClick={openWhatsApp}
                  className="elegant-text-primary p-2 rounded-lg border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
                  aria-label="WhatsApp"
                  title="Contáctanos por WhatsApp"
                >
                  <MessageCircle size={16} className="md:w-[18px] md:h-[18px] inking-icon" />
                </button>
                <button
                  onClick={openInstagram}
                  className="elegant-text-primary p-2 rounded-lg border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
                  aria-label="Instagram"
                  title="Síguenos en Instagram"
                >
                  <Instagram size={16} className="md:w-[18px] md:h-[18px] inking-icon" />
                </button>
              </div>

              <div className="w-px h-6 bg-black/20 dark:bg-white/20" />

              {/* Acciones principales */}
              <div className="flex items-center gap-1">
                {/* Carrito */}
                <button
                  className="relative elegant-text-primary p-2 rounded-lg border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
                  onClick={toggleCart}
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart size={16} className="md:w-[18px] md:h-[18px] inking-icon" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-black shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_4px_rgba(255,255,255,0.2)]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>

                {/* Hamburguesa móvil */}
                <button
                  onClick={toggleMobileMenu}
                  className="elegant-text-primary p-2 rounded-lg border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 md:hidden"
                >
                  {isMobileMenuOpen ? <X size={18} className="inking-icon" /> : <Menu size={18} className="inking-icon" />}
                </button>

                {/* Hamburguesa desktop */}
                <button
                  onClick={toggleUserMenu}
                  className="hidden md:block elegant-text-primary p-2 rounded-lg border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Menu size={18} className="inking-icon" />
                </button>
              </div>
            </div>

            {/* Dropdown usuario (Desktop) */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-3 w-64 comic-panel bg-white dark:bg-black border-2 border-black dark:border-white halftone-pattern overflow-hidden z-50 shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(255,255,255,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                {user ? (
                  <>
                    <div className="flex flex-col items-center px-6 py-5 border-b-2 border-black/10 dark:border-white/10 bg-white dark:bg-black stipple-pattern">
                      <div className="mb-3">
                        <div className="w-14 h-14 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.08)]">
                          <User size={24} className="elegant-text-primary inking-icon" />
                        </div>
                      </div>
                      <p className="text-sm font-bold elegant-text-primary truncate max-w-full">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2 bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 px-4 py-2 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_4px_rgba(255,255,255,0.06)]">
                        <Award size={14} className="elegant-text-primary inking-icon" />
                        <span className="elegant-text-primary text-sm font-bold">
                          {userProfile?.points ?? 0} pts
                        </span>
                      </div>
                      {userRole && userRole !== 'user' && (
                        <div className="mt-2 bg-black dark:bg-white px-4 py-1.5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_4px_rgba(255,255,255,0.2)]">
                          <span className="text-white dark:text-black text-xs font-bold uppercase">
                            {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                          </span>
                        </div>
                      )}
                    </div>

                    {renderUserMenuOptions().map((option, index) => (
                      <Link
                        key={index}
                        to={option.href}
                        className="w-full text-left px-6 py-4 elegant-text-primary hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 text-sm transition-all duration-300 font-bold border-b border-black/10 dark:border-white/10"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {option.icon}
                        <span className="font-bold">{option.label}</span>
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-4 text-white dark:text-black bg-black dark:bg-white flex items-center gap-3 text-sm transition-all duration-300 hover:bg-black/80 dark:hover:bg-white/80 font-bold border-t-2 border-black/10 dark:border-white/10"
                    >
                      <LogOut size={16} className="inking-icon" />
                      <span className="font-bold">Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <div className="p-6">
                    <Link
                      to="/auth"
                      className="comic-button w-full block text-center rounded-lg px-4 py-3 text-sm transition-all duration-300"
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
          className="md:hidden bg-white dark:bg-black halftone-pattern border-t-2 border-black/10 dark:border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(255,255,255,0.12)] animate-slideDown"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {user ? (
              <div className="flex flex-col items-center gap-4 mt-2 py-6 border-t-2 border-black/10 dark:border-white/10 bg-white dark:bg-black stipple-pattern rounded-lg comic-border shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.08)]">
                <div className="mb-2">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.08)]">
                    <User size={28} className="elegant-text-primary inking-icon" />
                  </div>
                </div>
                <span className="elegant-text-primary font-bold truncate max-w-[200px] text-sm">{user.email}</span>
                <div className="flex items-center gap-2 bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 px-3 py-2 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_4px_rgba(255,255,255,0.06)]">
                  <Award size={16} className="elegant-text-primary inking-icon" />
                  <span className="elegant-text-primary text-sm font-bold">
                    {userProfile?.points ?? 0} pts
                  </span>
                </div>
                {userRole && userRole !== 'user' && (
                  <div className="bg-black dark:bg-white px-3 py-1.5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_4px_rgba(255,255,255,0.2)]">
                    <span className="text-white dark:text-black text-xs font-bold uppercase">
                      {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                    </span>
                  </div>
                )}

                {/* Redes (móvil) */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={openWhatsApp}
                    className="bg-white dark:bg-black border-2 border-black dark:border-white elegant-text-primary rounded-lg p-3 transition-all duration-300 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={16} className="inking-icon" />
                    <span className="text-xs font-bold">WhatsApp</span>
                  </button>
                  <button
                    onClick={openInstagram}
                    className="bg-white dark:bg-black border-2 border-black dark:border-white elegant-text-primary rounded-lg p-3 transition-all duration-300 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
                    aria-label="Instagram"
                  >
                    <Instagram size={16} className="inking-icon" />
                    <span className="text-xs font-bold">Instagram</span>
                  </button>
                </div>

                <div className="w-full space-y-3 mt-4">
                  {renderUserMenuOptions().map((option, index) => (
                    <Link
                      key={index}
                      to={option.href}
                      className="w-full bg-white dark:bg-black border-2 border-black dark:border-white elegant-text-primary rounded-lg py-3 px-5 flex items-center justify-center gap-3 text-sm transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {option.icon}
                      <span className="font-bold">{option.label}</span>
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg py-3 px-5 flex items-center justify-center gap-3 text-sm transition-all duration-300 hover:bg-black/80 dark:hover:bg-white/80 font-bold border-2 border-black dark:border-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                  >
                    <LogOut size={18} className="inking-icon" />
                    <span className="font-bold">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 py-6 border-t-2 border-black/10 dark:border-white/10">
                <Link
                  to="/auth"
                  className="comic-button w-full block text-center rounded-lg px-6 py-4 transition-all duration-300"
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