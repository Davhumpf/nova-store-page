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
  Sun
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
  const { theme, toggleTheme } = useTheme();
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
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      } border-b border-[#A6A6A6]/10 dark:border-gray-700/30`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center">
          <div className="relative">
            <div className="relative bg-white dark:bg-gray-800 border border-[#A6A6A6]/20 dark:border-gray-700/50 rounded-full px-6 md:px-8 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-3 md:gap-5">
              
              {/* Logo / Título en burbuja con sombra */}
              <button
                onClick={goHome}
                className="text-xl font-light text-[#0D0D0D] dark:text-white hover:text-[#595959] dark:hover:text-gray-300 whitespace-nowrap transition-all duration-200 bg-[#D5DBDB] dark:bg-gray-700 px-5 py-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.6)]"
              >
                Nova Store
              </button>

              {/* Separador */}
              <div className="w-px h-6 bg-[#A6A6A6]/30 dark:bg-gray-600/50" />

              {/* 🌙 BOTÓN DE TEMA (SOL/LUNA) */}
              <button
                onClick={toggleTheme}
                className="text-[#0D0D0D] dark:text-yellow-400 hover:text-[#4FC3F7] dark:hover:text-yellow-300 p-2 hover:bg-[#F2F2F2] dark:hover:bg-gray-700 rounded-md transition-all duration-200"
                aria-label="Cambiar tema"
                title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              >
                {theme === 'light' ? (
                  <Moon size={16} className="md:w-[18px] md:h-[18px]" />
                ) : (
                  <Sun size={16} className="md:w-[18px] md:h-[18px]" />
                )}
              </button>

              <div className="w-px h-6 bg-[#A6A6A6]/30 dark:bg-gray-600/50" />

              {/* Redes */}
              <div className="flex items-center gap-1">
                <button
                  onClick={openWhatsApp}
                  className="text-[#4CAF50] hover:text-[#66FF7A] dark:text-[#66FF7A] dark:hover:text-[#4CAF50] p-2 hover:bg-[#F2F2F2] dark:hover:bg-gray-700 rounded-md transition-all duration-200"
                  aria-label="WhatsApp"
                  title="Contáctanos por WhatsApp"
                >
                  <MessageCircle size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
                <button
                  onClick={openInstagram}
                  className="text-[#BA68C8] hover:text-[#E1BEE7] dark:text-[#CE93D8] dark:hover:text-[#E1BEE7] p-2 hover:bg-[#F2F2F2] dark:hover:bg-gray-700 rounded-md transition-all duration-200"
                  aria-label="Instagram"
                  title="Síguenos en Instagram"
                >
                  <Instagram size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>

              <div className="w-px h-6 bg-[#A6A6A6]/30 dark:bg-gray-600/50" />

              {/* Acciones principales */}
              <div className="flex items-center gap-1">
                {/* Carrito */}
                <button
                  className="relative text-[#0D0D0D] dark:text-white hover:text-[#4FC3F7] dark:hover:text-[#81D4FA] p-2 hover:bg-[#F2F2F2] dark:hover:bg-gray-700 rounded-md transition-all duration-200"
                  onClick={toggleCart}
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#4FC3F7] dark:bg-[#81D4FA] text-white dark:text-gray-900 text-xs font-semibold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center shadow-md">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>

                {/* Hamburguesa móvil */}
                <button
                  onClick={toggleMobileMenu}
                  className="text-[#0D0D0D] dark:text-white hover:text-[#595959] dark:hover:text-gray-300 p-2 hover:bg-[#F2F2F2] dark:hover:bg-gray-700 rounded-md transition-all duration-200 md:hidden"
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {/* Hamburguesa desktop */}
                <button
                  onClick={toggleUserMenu}
                  className="hidden md:block text-[#0D0D0D] dark:text-white hover:text-[#595959] dark:hover:text-gray-300 p-2 hover:bg-[#F2F2F2] dark:hover:bg-gray-700 rounded-md transition-all duration-200"
                >
                  <Menu size={18} />
                </button>
              </div>
            </div>

            {/* Dropdown usuario (Desktop) */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-gray-800 backdrop-blur-sm shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden z-50 border border-[#A6A6A6]/20 dark:border-gray-700/50"
                onClick={(e) => e.stopPropagation()}
              >
                {user ? (
                  <>
                    <div className="flex flex-col items-center px-6 py-5 border-b border-[#A6A6A6]/10 dark:border-gray-700/30 bg-[#F2F2F2] dark:bg-gray-700/50">
                      <div className="mb-3">
                        <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center border-2 border-[#4CAF50]/50 dark:border-[#66FF7A]/50 shadow-md">
                          <User size={24} className="text-[#4CAF50] dark:text-[#66FF7A]" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-[#0D0D0D] dark:text-white truncate max-w-full">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2 bg-white dark:bg-gray-600 px-4 py-2 rounded-md border border-[#A6A6A6]/20 dark:border-gray-500/50 shadow-sm">
                        <Award size={14} className="text-[#4FC3F7] dark:text-[#81D4FA]" />
                        <span className="text-[#0D0D0D] dark:text-white text-sm font-semibold">
                          {userProfile?.points ?? 0} pts
                        </span>
                      </div>
                      {userRole && userRole !== 'user' && (
                        <div className="mt-2 bg-[#BA68C8]/10 dark:bg-[#BA68C8]/20 px-4 py-1.5 rounded-md border border-[#BA68C8]/30 dark:border-[#CE93D8]/40">
                          <span className="text-[#BA68C8] dark:text-[#CE93D8] text-xs font-semibold uppercase">
                            {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                          </span>
                        </div>
                      )}
                    </div>

                    {renderUserMenuOptions().map((option, index) => (
                      <Link
                        key={index}
                        to={option.href}
                        className={`w-full text-left px-6 py-4 text-[#595959] dark:text-gray-300 hover:bg-[#F2F2F2] dark:hover:bg-gray-700 flex items-center gap-3 ${option.color} text-sm transition-all duration-200`}
                        onClick={() => setShowUserMenu(false)}
                      >
                        {option.icon}
                        <span className="font-medium">{option.label}</span>
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-4 text-[#595959] dark:text-gray-300 hover:bg-[#F2F2F2] dark:hover:bg-gray-700 flex items-center gap-3 hover:text-red-500 dark:hover:text-red-400 text-sm border-t border-[#A6A6A6]/10 dark:border-gray-700/30 transition-all duration-200"
                    >
                      <LogOut size={16} />
                      <span className="font-medium">Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <div className="p-6">
                    <Link
                      to="/auth"
                      className="w-full block text-center bg-[#0D0D0D] dark:bg-gray-700 hover:bg-[#262626] dark:hover:bg-gray-600 text-[#4CAF50] dark:text-[#66FF7A] rounded-md px-4 py-3 font-semibold text-sm transition-colors duration-200 shadow-md"
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
          className="md:hidden bg-white dark:bg-gray-800 backdrop-blur-sm border-t border-[#A6A6A6]/10 dark:border-gray-700/30 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {user ? (
              <div className="flex flex-col items-center gap-4 mt-2 py-6 border-t border-[#A6A6A6]/10 dark:border-gray-700/30 bg-[#F2F2F2] dark:bg-gray-700/50 rounded-lg">
                <div className="mb-2">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center border-2 border-[#4CAF50]/50 dark:border-[#66FF7A]/50 shadow-md">
                    <User size={28} className="text-[#4CAF50] dark:text-[#66FF7A]" />
                  </div>
                </div>
                <span className="text-[#0D0D0D] dark:text-white font-medium truncate max-w-[200px] text-sm">{user.email}</span>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-600 px-3 py-2 rounded-md border border-[#A6A6A6]/20 dark:border-gray-500/50 shadow-sm">
                  <Award size={16} className="text-[#4FC3F7] dark:text-[#81D4FA]" />
                  <span className="text-[#0D0D0D] dark:text-white text-sm font-semibold">
                    {userProfile?.points ?? 0} pts
                  </span>
                </div>
                {userRole && userRole !== 'user' && (
                  <div className="bg-[#BA68C8]/10 dark:bg-[#BA68C8]/20 px-3 py-1.5 rounded-md border border-[#BA68C8]/30 dark:border-[#CE93D8]/40">
                    <span className="text-[#BA68C8] dark:text-[#CE93D8] text-xs font-semibold uppercase">
                      {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                    </span>
                  </div>
                )}

                {/* Redes (móvil) */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={openWhatsApp}
                    className="bg-[#4CAF50] hover:bg-[#66FF7A] dark:bg-[#66FF7A] dark:hover:bg-[#4CAF50] text-white dark:text-gray-900 rounded-md p-3 transition-colors duration-200 flex items-center gap-2 shadow-md"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={16} />
                    <span className="text-xs font-semibold">WhatsApp</span>
                  </button>
                  <button
                    onClick={openInstagram}
                    className="bg-[#BA68C8] hover:bg-[#E1BEE7] dark:bg-[#CE93D8] dark:hover:bg-[#E1BEE7] text-white dark:text-gray-900 rounded-md p-3 transition-all duration-200 flex items-center gap-2 shadow-md"
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
                      className="w-full bg-white dark:bg-gray-600 border border-[#A6A6A6]/20 dark:border-gray-500/50 text-[#595959] dark:text-gray-200 rounded-md py-3 px-5 flex items-center justify-center gap-3 hover:border-[#4CAF50]/50 dark:hover:border-[#66FF7A]/50 hover:text-[#4CAF50] dark:hover:text-[#66FF7A] text-sm transition-all duration-200 shadow-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {option.icon}
                      <span className="font-semibold">{option.label}</span>
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/80 hover:bg-red-500 dark:bg-red-600/80 dark:hover:bg-red-600 text-white rounded-md py-3 px-5 flex items-center justify-center gap-3 text-sm transition-all duration-200 shadow-md"
                  >
                    <LogOut size={18} />
                    <span className="font-semibold">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 py-6 border-t border-[#A6A6A6]/10 dark:border-gray-700/30">
                <Link
                  to="/auth"
                  className="w-full block text-center bg-[#0D0D0D] dark:bg-gray-700 hover:bg-[#262626] dark:hover:bg-gray-600 text-[#4CAF50] dark:text-[#66FF7A] rounded-md px-6 py-4 font-semibold transition-colors duration-200 shadow-md"
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