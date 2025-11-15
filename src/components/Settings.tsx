import React, { useState } from 'react';
import { User, Mail, Bell, Shield, Moon, Sun, Globe, Save } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });
  const [language, setLanguage] = useState('es');

  const handleSave = () => {
    console.log('Configuraciones guardadas');
  };

  return (
    <div className="min-h-screen crosshatch-pattern py-6 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black comic-text-shadow text-[#0D0D0D] dark:text-white mb-2">Configuración</h1>
          <p className="text-[#0D0D0D] dark:text-white font-bold">Personaliza tu experiencia en Nova Store</p>
        </div>

        <div className="space-y-5">
          {/* Perfil */}
          <div className="comic-panel p-5 animate-comic-bounce">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-[#FF1493] dark:text-[#FFD700]" size={20} />
              <h2 className="text-lg font-black comic-text-shadow text-[#0D0D0D] dark:text-white">Perfil</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#0D0D0D] dark:text-white mb-2">Correo electrónico</label>
                <div className="comic-input p-3 flex items-center gap-3">
                  <Mail size={16} className="text-[#0D0D0D] dark:text-white" />
                  <span className="text-[#0D0D0D] dark:text-white font-bold">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0D0D0D] dark:text-white mb-2">Puntos acumulados</label>
                <div className="comic-input p-3 flex items-center gap-3 bg-gradient-to-r from-[#FFD700] to-[#FF8C00]">
                  <div className="w-4 h-4 bg-[#0D0D0D] dark:bg-white rounded-full"></div>
                  <span className="text-[#0D0D0D] dark:text-white font-black">0 puntos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="stipple-pattern h-4"></div>

          {/* Notificaciones */}
          <div className="comic-panel p-5 animate-comic-bounce">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-[#00CED1] dark:text-[#FF69B4]" size={20} />
              <h2 className="text-lg font-black comic-text-shadow text-[#0D0D0D] dark:text-white">Notificaciones</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[#0D0D0D] dark:text-white font-black text-sm">Notificaciones por email</label>
                  <p className="text-xs text-[#0D0D0D] dark:text-white font-bold opacity-70">Recibe ofertas y novedades</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                  className={`relative w-12 h-6 rounded-full transition-colors comic-border ${
                    notifications.email ? 'bg-gradient-to-r from-[#FF1493] to-[#FFD700]' : 'bg-gradient-to-r from-[#A6A6A6] to-[#595959]'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white dark:bg-[#0D0D0D] rounded-full top-0.5 transition-transform shadow-md border-2 border-[#0D0D0D] dark:border-white ${
                    notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[#0D0D0D] dark:text-white font-black text-sm">Notificaciones push</label>
                  <p className="text-xs text-[#0D0D0D] dark:text-white font-bold opacity-70">Alertas en tiempo real</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                  className={`relative w-12 h-6 rounded-full transition-colors comic-border ${
                    notifications.push ? 'bg-gradient-to-r from-[#FF1493] to-[#FFD700]' : 'bg-gradient-to-r from-[#A6A6A6] to-[#595959]'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white dark:bg-[#0D0D0D] rounded-full top-0.5 transition-transform shadow-md border-2 border-[#0D0D0D] dark:border-white ${
                    notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="stipple-pattern h-4"></div>

          {/* Preferencias */}
          <div className="comic-panel p-5 animate-comic-bounce">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-[#4ECDC4] dark:text-[#FF6B6B]" size={20} />
              <h2 className="text-lg font-black comic-text-shadow text-[#0D0D0D] dark:text-white">Preferencias</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Sun size={16} className="text-[#FFD700]" />
                  ) : (
                    <Moon size={16} className="text-[#0D0D0D] dark:text-white" />
                  )}
                  <label className="text-[#0D0D0D] dark:text-white font-black text-sm">Modo oscuro</label>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors comic-border ${
                    theme === 'dark' ? 'bg-gradient-to-r from-[#4ECDC4] to-[#44A08D]' : 'bg-gradient-to-r from-[#A6A6A6] to-[#595959]'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white dark:bg-[#0D0D0D] rounded-full top-0.5 transition-transform shadow-md border-2 border-[#0D0D0D] dark:border-white ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-[#0D0D0D] dark:text-white" />
                  <label className="text-[#0D0D0D] dark:text-white font-black text-sm">Idioma</label>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="comic-input px-3 py-2 text-sm font-bold"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <button
            onClick={handleSave}
            className="comic-button w-full py-3 px-6 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] transform hover:scale-[1.02]"
          >
            <Save size={18} />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;