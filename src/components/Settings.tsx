import React, { useState } from 'react';
import { User, Mail, Bell, Shield, Moon, Globe, Save } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Settings: React.FC = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('es');

  const handleSave = () => {
    console.log('Configuraciones guardadas');
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-6 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-light text-[#0D0D0D] mb-2">Configuración</h1>
          <p className="text-[#595959] font-light">Personaliza tu experiencia en Nova Store</p>
        </div>

        <div className="space-y-5">
          {/* Perfil */}
          <div className="bg-white rounded-xl p-5 border border-[#A6A6A6]/20 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-[#4CAF50]" size={20} />
              <h2 className="text-lg font-medium text-[#0D0D0D]">Perfil</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#595959] mb-2 font-light">Correo electrónico</label>
                <div className="bg-[#F2F2F2] border border-[#A6A6A6]/20 rounded-lg p-3 flex items-center gap-3">
                  <Mail size={16} className="text-[#595959]" />
                  <span className="text-[#0D0D0D]">{user?.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-[#595959] mb-2 font-light">Puntos acumulados</label>
                <div className="bg-[#F2F2F2] border border-[#A6A6A6]/20 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#4CAF50] rounded-full"></div>
                  <span className="text-[#0D0D0D]">0 puntos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-xl p-5 border border-[#A6A6A6]/20 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-[#4FC3F7]" size={20} />
              <h2 className="text-lg font-medium text-[#0D0D0D]">Notificaciones</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[#0D0D0D] font-medium text-sm">Notificaciones por email</label>
                  <p className="text-xs text-[#595959] font-light">Recibe ofertas y novedades</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-[#4CAF50]' : 'bg-[#A6A6A6]/30'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow-md ${
                    notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[#0D0D0D] font-medium text-sm">Notificaciones push</label>
                  <p className="text-xs text-[#595959] font-light">Alertas en tiempo real</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.push ? 'bg-[#4CAF50]' : 'bg-[#A6A6A6]/30'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow-md ${
                    notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Preferencias */}
          <div className="bg-white rounded-xl p-5 border border-[#A6A6A6]/20 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-[#BA68C8]" size={20} />
              <h2 className="text-lg font-medium text-[#0D0D0D]">Preferencias</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon size={16} className="text-[#595959]" />
                  <label className="text-[#0D0D0D] font-medium text-sm">Modo oscuro</label>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-[#4CAF50]' : 'bg-[#A6A6A6]/30'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow-md ${
                    darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-[#595959]" />
                  <label className="text-[#0D0D0D] font-medium text-sm">Idioma</label>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#F2F2F2] border border-[#A6A6A6]/20 rounded-lg px-3 py-2 text-[#0D0D0D] text-sm focus:border-[#4CAF50] focus:outline-none transition-colors font-light"
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
            className="w-full bg-[#0D0D0D] hover:bg-[#262626] text-[#4CAF50] font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
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