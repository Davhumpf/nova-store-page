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
      className={`sticky top-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/98 dark:bg-black/98 backdrop-blur-sm shadow-sm'
          : 'bg-white dark:bg-black'
      } border-b border-black/10 dark:border-white/10`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center">
          <div className="relative">
            <div className="relative bg-white dark:bg-black px-6 md:px-8 py-3 flex items-center gap-3 md:gap-5 rounded-lg border border-black/5 dark:border-white/5">

              {/* Logo / Título simple */}
              <button
                onClick={goHome}
                className="text-xl font-bold elegant-text-primary whitespace-nowrap transition-all duration-200 px-4 py-1 uppercase tracking-wide"
              >
                Nova Store
              </button>

              {/* Separador */}
              <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

              {/* 🌙 BOTÓN DE TEMA (SOL/LUNA/MONITOR) - Three Modes */}
              <button
                onClick={toggleTheme}
                className="elegant-text-primary p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
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

              <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

              {/* Redes */}
              <div className="flex items-center gap-1">
                <button
                  onClick={openWhatsApp}
                  className="elegant-text-primary p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
                  aria-label="WhatsApp"
                  title="Contáctanos por WhatsApp"
                >
                  <MessageCircle size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
                <button
                  onClick={openInstagram}
                  className="elegant-text-primary p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
                  aria-label="Instagram"
                  title="Síguenos en Instagram"
                >
                  <Instagram size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>

              <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

              {/* Acciones principales */}
              <div className="flex items-center gap-1">
                {/* Carrito */}
                <button
                  className="relative elegant-text-primary p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
                  onClick={toggleCart}
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>

                {/* Hamburguesa móvil */}
                <button
                  onClick={toggleMobileMenu}
                  className="elegant-text-primary p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 md:hidden"
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {/* Hamburguesa desktop */}
                <button
                  onClick={toggleUserMenu}
                  className="hidden md:block elegant-text-primary p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
                >
                  <Menu size={18} />
                </button>
              </div>
            </div>

            {/* Dropdown usuario (Desktop) */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg overflow-hidden z-50 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {user ? (
                  <>
                    <div className="flex flex-col items-center px-6 py-4 border-b border-black/10 dark:border-white/10">
                      <div className="mb-2">
                        <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                          <User size={20} className="elegant-text-primary" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold elegant-text-primary truncate max-w-full">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/5">
                        <Award size={12} className="elegant-text-primary" />
                        <span className="elegant-text-primary text-xs font-semibold">
                          {userProfile?.points ?? 0} pts
                        </span>
                      </div>
                      {userRole && userRole !== 'user' && (
                        <div className="mt-2 bg-black dark:bg-white px-3 py-1 rounded-md">
                          <span className="text-white dark:text-black text-xs font-semibold uppercase">
                            {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                          </span>
                        </div>
                      )}
                    </div>

                    {renderUserMenuOptions().map((option, index) => (
                      <Link
                        key={index}
                        to={option.href}
                        className="w-full text-left px-6 py-3 elegant-text-primary hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 text-sm transition-colors duration-200 font-medium border-b border-black/5 dark:border-white/5"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-3 text-white dark:text-black bg-black dark:bg-white flex items-center gap-3 text-sm transition-colors duration-200 hover:bg-black/90 dark:hover:bg-white/90 font-medium"
                    >
                      <LogOut size={16} />
                      <span>Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <div className="p-4">
                    <Link
                      to="/auth"
                      className="classic-btn w-full block text-center px-4 py-2.5 text-sm"
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
          className="md:hidden bg-white dark:bg-black border-t border-black/10 dark:border-white/10 shadow-lg animate-slideDown"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            {user ? (
              <div className="flex flex-col items-center gap-3 py-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-black flex items-center justify-center border border-black/10 dark:border-white/10">
                  <User size={24} className="elegant-text-primary" />
                </div>
                <span className="elegant-text-primary font-semibold truncate max-w-[200px] text-sm">{user.email}</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-black">
                  <Award size={14} className="elegant-text-primary" />
                  <span className="elegant-text-primary text-xs font-semibold">
                    {userProfile?.points ?? 0} pts
                  </span>
                </div>
                {userRole && userRole !== 'user' && (
                  <div className="bg-black dark:bg-white px-3 py-1 rounded-md">
                    <span className="text-white dark:text-black text-xs font-semibold uppercase">
                      {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                    </span>
                  </div>
                )}

                {/* Redes (móvil) */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={openWhatsApp}
                    className="bg-white dark:bg-black border border-black/10 dark:border-white/10 elegant-text-primary rounded-md px-3 py-2 transition-colors duration-200 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={16} />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </button>
                  <button
                    onClick={openInstagram}
                    className="bg-white dark:bg-black border border-black/10 dark:border-white/10 elegant-text-primary rounded-md px-3 py-2 transition-colors duration-200 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5"
                    aria-label="Instagram"
                  >
                    <Instagram size={16} />
                    <span className="text-xs font-medium">Instagram</span>
                  </button>
                </div>

                <div className="w-full space-y-2 mt-3">
                  {renderUserMenuOptions().map((option, index) => (
                    <Link
                      key={index}
                      to={option.href}
                      className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 elegant-text-primary rounded-md py-2.5 px-4 flex items-center justify-center gap-2 text-sm transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-md py-2.5 px-4 flex items-center justify-center gap-2 text-sm transition-colors duration-200 hover:bg-black/90 dark:hover:bg-white/90 font-medium"
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <Link
                  to="/auth"
                  className="classic-btn w-full block text-center px-4 py-2.5 text-sm"
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