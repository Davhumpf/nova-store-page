import React, { useState } from 'react';
import { User, Mail, Bell, Shield, Moon, Globe, Save } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Settings: React.FC = () => {
  const { user, userProfile } = useUser();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('es');

  const handleSave = () => {
    // Aquí implementarías la lógica para guardar configuraciones
    console.log('Configuraciones guardadas');
  };

  return (
    <div className="min-h-screen bg-[#18001B] pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FAE5D8] mb-2">Configuración</h1>
          <p className="text-[#B0B0B0]">Personaliza tu experiencia en Nova Store</p>
        </div>

        <div className="space-y-6">
          {/* Perfil */}
          <div className="bg-[#2A0A2E] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-[#FFD600]" size={20} />
              <h2 className="text-xl font-semibold text-[#FAE5D8]">Perfil</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#B0B0B0] mb-2">Correo electrónico</label>
                <div className="bg-[#18001B] border border-[#4A1A4F] rounded-lg p-3 flex items-center gap-3">
                  <Mail size={16} className="text-[#B0B0B0]" />
                  <span className="text-[#FAE5D8]">{user?.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-[#B0B0B0] mb-2">Puntos acumulados</label>
                <div className="bg-[#18001B] border border-[#4A1A4F] rounded-lg p-3 flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#FFD600] rounded-full"></div>
                  <span className="text-[#FAE5D8]">{userProfile?.points || 0} puntos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-[#2A0A2E] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-[#FFD600]" size={20} />
              <h2 className="text-xl font-semibold text-[#FAE5D8]">Notificaciones</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[#FAE5D8] font-medium">Notificaciones por email</label>
                  <p className="text-sm text-[#B0B0B0]">Recibe ofertas y novedades</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-[#FFD600]' : 'bg-[#4A1A4F]'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[#FAE5D8] font-medium">Notificaciones push</label>
                  <p className="text-sm text-[#B0B0B0]">Alertas en tiempo real</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.push ? 'bg-[#FFD600]' : 'bg-[#4A1A4F]'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Preferencias */}
          <div className="bg-[#2A0A2E] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-[#FFD600]" size={20} />
              <h2 className="text-xl font-semibold text-[#FAE5D8]">Preferencias</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon size={16} className="text-[#B0B0B0]" />
                  <label className="text-[#FAE5D8] font-medium">Modo oscuro</label>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-[#FFD600]' : 'bg-[#4A1A4F]'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-[#B0B0B0]" />
                  <label className="text-[#FAE5D8] font-medium">Idioma</label>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#18001B] border border-[#4A1A4F] rounded-lg px-3 py-2 text-[#FAE5D8] text-sm"
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
            className="w-full bg-gradient-to-r from-[#FFD600] to-[#E6C200] text-[#18001B] font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:from-[#E6C200] hover:to-[#D4AF00] transition-all duration-300 transform hover:scale-[1.02]"
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