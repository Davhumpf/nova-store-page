// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, LogOut, User, Award, Settings, Shield, UserCheck, Instagram, MessageCircle, Moon, Sun, Monitor } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

interface HeaderProps {
  showHeaderTitle?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showHeaderTitle = false }) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, userProfile } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchUserRole = async () => {
      try {
        if (!user?.email) {
          if (mounted) setUserRole(null);
          return;
        }
        const emailLower = user.email.toLowerCase();
        if (emailLower === 'scpu.v1@gmail.com') {
          if (mounted) setUserRole('super_admin');
          return;
        }
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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

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

  const renderUserMenuOptions = () => {
    const base = [
      { href: '/profile', icon: <User size={16} />, label: 'Perfil' },
      { href: '/settings', icon: <Settings size={16} />, label: 'Configuración' }
    ];
    const extras: { href: string; icon: JSX.Element; label: string }[] = [];
    if (userRole === 'super_admin') {
      extras.push({ href: '/AdminDashboard', icon: <Shield size={16} />, label: 'Panel Admin' });
    } else if (userRole === 'admin') {
      extras.push({ href: '/AdminDashboard', icon: <UserCheck size={16} />, label: 'Panel Admin' });
    } else if (userRole === 'collaborator') {
      extras.push({ href: '/collaborations', icon: <UserCheck size={16} />, label: 'Herramientas' });
    }
    return [...base, ...extras];
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-150 ${
        isScrolled
          ? 'bg-white/95 dark:bg-purple-950/95 shadow-lg shadow-purple-500/5'
          : 'bg-white dark:bg-purple-950'
      } border-b border-purple-200 dark:border-purple-800/50`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goHome}
            className="text-lg font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-150"
          >
            Nova Store
          </button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-150"
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
            </button>

            <button
              onClick={openWhatsApp}
              className="p-2 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-150"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </button>

            <button
              onClick={openInstagram}
              className="p-2 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-150"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </button>

            <button
              className="relative p-2 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-150"
              onClick={toggleCart}
              aria-label="Carrito"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 dark:bg-purple-400 text-white dark:text-purple-950 text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleUserMenu}
              className="p-2 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-150"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              className="relative p-2 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-150"
              onClick={toggleCart}
              aria-label="Carrito"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 dark:bg-purple-400 text-white dark:text-purple-950 text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-150"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Desktop Dropdown */}
        {showUserMenu && (
          <div
            className="hidden md:block absolute right-4 top-full mt-2 w-72 bg-white dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl shadow-xl animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {user ? (
              <>
                <div className="p-4 border-b border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <User size={18} className="text-purple-700 dark:text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-purple-950 dark:text-purple-50 truncate">{user.email}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Award size={12} />
                        {userProfile?.points ?? 0} pts
                      </p>
                    </div>
                  </div>
                  {userRole && userRole !== 'user' && (
                    <div className="mt-2">
                      <span className="inline-block bg-purple-600 dark:bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded">
                        {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="py-1">
                  {renderUserMenuOptions().map((option, index) => (
                    <Link
                      key={index}
                      to={option.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors duration-150"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="p-2 border-t border-purple-200 dark:border-purple-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-lg transition-colors duration-150"
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4">
                <Link
                  to="/auth"
                  className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-purple-600 dark:bg-purple-500 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-150"
                  onClick={() => setShowUserMenu(false)}
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden bg-white dark:bg-purple-950 border-t border-purple-200 dark:border-purple-800 animate-slide-down"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-800 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-150"
              >
                {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
              </button>
              <button
                onClick={openWhatsApp}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-800 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-150"
              >
                <MessageCircle size={16} />
              </button>
              <button
                onClick={openInstagram}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-800 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-150"
              >
                <Instagram size={16} />
              </button>
            </div>

            {user ? (
              <>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-purple-950 flex items-center justify-center">
                      <User size={18} className="text-purple-700 dark:text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-purple-950 dark:text-purple-50 truncate">{user.email}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Award size={12} />
                        {userProfile?.points ?? 0} pts
                      </p>
                    </div>
                  </div>
                  {userRole && userRole !== 'user' && (
                    <span className="inline-block bg-purple-600 dark:bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded">
                      {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Colaborador'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {renderUserMenuOptions().map((option, index) => (
                    <Link
                      key={index}
                      to={option.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-lg transition-colors duration-150"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 dark:bg-purple-500 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-150"
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-purple-600 dark:bg-purple-500 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
