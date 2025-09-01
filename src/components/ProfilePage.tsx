import React, { useState, useEffect } from 'react';
import { User, Camera, UploadCloud, Award, Loader, Edit3, Save, X, Gift, Star, TrendingUp, Calendar, MessageCircle, Crown, Trophy, Target, Coins, Rocket, Sparkles, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { updateUserPhoto } from '../services/UserService';

const ProfilePage: React.FC = () => {
  const { user, userProfile, refreshUserProfile } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    displayName: '',
    phone: '',
    birthDate: '',
    favoriteCategory: 'streaming'
  });

  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      setTempProfile({
        displayName: userProfile.displayName || user?.email?.split('@')[0] || '',
        phone: userProfile.phone || '',
        birthDate: userProfile.birthDate || '',
        favoriteCategory: userProfile.favoriteCategory || 'streaming'
      });
    }
  }, [userProfile, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      const file = e.target.files[0];
      const storageRef = ref(storage, `profile_photos/${user.uid}`);
      
      setUploadProgress(30);
      await uploadBytes(storageRef, file);
      
      setUploadProgress(70);
      const photoURL = await getDownloadURL(storageRef);
      
      // Actualizar perfil del usuario en Auth
      await updateProfile(user, { photoURL });
      
      // Actualizar en Firestore
      await updateUserPhoto(user.uid, photoURL);
      
      setUploadProgress(100);
      await refreshUserProfile();
      
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Aquí puedes agregar la lógica para guardar en Firebase/Firestore
      // Por ejemplo: await updateUserProfile(user.uid, tempProfile);
      setIsEditing(false);
      // await refreshUserProfile();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setTempProfile({
        displayName: userProfile.displayName || user?.email?.split('@')[0] || '',
        phone: userProfile.phone || '',
        birthDate: userProfile.birthDate || '',
        favoriteCategory: userProfile.favoriteCategory || 'streaming'
      });
    }
    setIsEditing(false);
  };

  const handleRedeemPoints = () => {
    const points = userProfile?.points || 0;
    const message = encodeURIComponent(`¡Hola! Quiero redimir mis puntos de Nova Store. Tengo ${points} puntos disponibles.`);
    window.open(`https://wa.me/573027214125?text=${message}`, '_blank');
  };

  const calculateDaysAsMember = () => {
    if (!userProfile?.createdAt) return 0;
    const joinDate = new Date(userProfile.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUserLevel = (points: number) => {
    if (points >= 2000) return { level: 'Platino', color: 'from-slate-300 to-slate-500', icon: <Crown className="w-5 h-5" /> };
    if (points >= 1000) return { level: 'Oro', color: 'from-yellow-400 to-yellow-600', icon: <Trophy className="w-5 h-5" /> };
    if (points >= 500) return { level: 'Plata', color: 'from-slate-400 to-slate-600', icon: <Star className="w-5 h-5" /> };
    return { level: 'Bronce', color: 'from-orange-400 to-orange-600', icon: <Target className="w-5 h-5" /> };
  };

  const rewards = [
    { id: 1, name: 'Descuento 10%', points: 500, icon: <Gift className="w-6 h-6" />, color: 'from-blue-500 to-blue-600' },
    { id: 2, name: 'Descuento 25%', points: 1000, icon: <Star className="w-6 h-6" />, color: 'from-purple-500 to-purple-600' },
    { id: 3, name: 'Producto Gratis', points: 1500, icon: <Crown className="w-6 h-6" />, color: 'from-yellow-500 to-yellow-600' },
    { id: 4, name: '3 meses de plataforma gratis', points: 2000, icon: <Rocket className="w-6 h-6" />, color: 'from-green-500 to-green-600' }
  ];

  const handleRewardSelect = (reward: any) => {
    const points = userProfile?.points || 0;
    if (points >= reward.points) {
      const message = encodeURIComponent(`¡Hola! Quiero canjear mi recompensa: ${reward.name} (${reward.points} puntos). Tengo ${points} puntos disponibles.`);
      window.open(`https://wa.me/573027214125?text=${message}`, '_blank');
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-300">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const userLevel = getUserLevel(userProfile.points || 0);
  const daysAsMember = calculateDaysAsMember();

  const userStats = [
    { label: 'Puntos Totales', value: userProfile.points || 0, icon: <Coins className="w-5 h-5" />, color: 'text-yellow-400' },
    { label: 'Compras Realizadas', value: userProfile.totalPurchases || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Recompensas Canjeadas', value: userProfile.rewardsRedeemed || 0, icon: <Trophy className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'Días como miembro', value: daysAsMember, icon: <Calendar className="w-5 h-5" />, color: 'text-purple-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header con animación */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-500 mb-2">
            Mi Perfil Nova
          </h1>
          <p className="text-slate-300">Gestiona tu cuenta y descubre tus recompensas</p>
        </div>

        {/* Tarjeta principal de perfil */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden mb-8 shadow-xl">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-xl blur-lg"></div>
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              {/* Foto de perfil con efectos */}
              <div className="relative group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  {userProfile.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt="Foto de perfil" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transform group-hover:scale-105 transition-all duration-300 relative z-10"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-slate-600 flex items-center justify-center border-4 border-white shadow-lg relative z-10">
                      <User size={48} className="text-white" />
                    </div>
                  )}
                  
                  {isUploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black bg-opacity-70 z-20">
                      <Loader size={24} className="text-yellow-400 animate-spin" />
                      <span className="text-xs text-white mt-1">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <label 
                      htmlFor="profile-photo" 
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 cursor-pointer transition-all duration-300 z-20"
                    >
                      <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </label>
                  )}
                </div>
                
                <input 
                  type="file" 
                  id="profile-photo" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                
                <label 
                  htmlFor="profile-photo" 
                  className="mt-4 text-slate-900 font-semibold flex items-center gap-2 cursor-pointer hover:text-slate-700 transition-colors justify-center"
                >
                  <UploadCloud size={16} />
                  Cambiar foto
                </label>
              </div>

              {/* Información del usuario */}
              <div className="flex-1 text-slate-900 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">
                  {userProfile.displayName || user.email?.split('@')[0] || 'Usuario Nova'}
                </h2>
                <p className="text-slate-700 mb-3">{user.email}</p>
                
                {/* Nivel del usuario */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${userLevel.color} text-white font-semibold shadow-lg`}>
                  {userLevel.icon}
                  <span>Nivel {userLevel.level}</span>
                </div>
              </div>

              {/* Puntos destacados */}
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-6 h-6 text-slate-900" />
                    <span className="text-slate-900 font-semibold">Puntos Nova</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{userProfile.points || 0}</div>
                  <button 
                    onClick={handleRedeemPoints}
                    className="mt-3 bg-white/90 backdrop-blur-sm text-slate-900 px-6 py-2 rounded-xl font-semibold hover:bg-white transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto shadow-lg"
                  >
                    <MessageCircle size={16} />
                    Redimir Puntos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userStats.map((stat, index) => (
                <div key={index} className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-slate-700/30 transition-all duration-300 transform hover:scale-105 border border-slate-700/50">
                  <div className={`${stat.color} mb-2 flex justify-center`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información personal editable */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Información Personal</h3>
            {!isEditing ? (
              <button 
                onClick={handleEdit}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Edit3 size={16} />
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Save size={16} />
                  Guardar
                </button>
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Correo electrónico</label>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3">{user.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Nombre completo</label>
              {isEditing ? (
                <input 
                  type="text"
                  value={tempProfile.displayName}
                  onChange={(e) => setTempProfile({...tempProfile, displayName: e.target.value})}
                  className="w-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors"
                  placeholder="Ingresa tu nombre completo"
                />
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3">
                  {userProfile.displayName || tempProfile.displayName || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Teléfono</label>
              {isEditing ? (
                <input 
                  type="tel"
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                  className="w-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors"
                  placeholder="Ej: +57 300 123 4567"
                />
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3">
                  {userProfile.phone || tempProfile.phone || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Fecha de nacimiento</label>
              {isEditing ? (
                <input 
                  type="date"
                  value={tempProfile.birthDate}
                  onChange={(e) => setTempProfile({...tempProfile, birthDate: e.target.value})}
                  className="w-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors"
                />
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3">
                  {userProfile.birthDate || tempProfile.birthDate || 'No especificado'}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Categoría favorita</label>
              {isEditing ? (
                <select 
                  value={tempProfile.favoriteCategory}
                  onChange={(e) => setTempProfile({...tempProfile, favoriteCategory: e.target.value})}
                  className="w-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors"
                >
                  <option value="streaming">Streaming</option>
                  <option value="gaming">Gaming</option>
                  <option value="music">Música</option>
                  <option value="software">Software</option>
                  <option value="education">Educación</option>
                </select>
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-white rounded-xl px-4 py-3 capitalize">
                  {userProfile.favoriteCategory || tempProfile.favoriteCategory}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sistema de recompensas */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Recompensas Disponibles
            </h3>
            <button 
              onClick={() => setShowRewardsModal(true)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold"
            >
              Ver todas
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((reward) => (
              <div 
                key={reward.id}
                className={`relative group bg-gradient-to-br ${reward.color} rounded-xl p-4 text-white cursor-pointer transition-all duration-300 border border-white/20 ${
                  (userProfile.points || 0) >= reward.points ? 'transform hover:scale-105 shadow-lg hover:shadow-xl' : 'opacity-60'
                }`}
                onClick={() => handleRewardSelect(reward)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    {reward.icon}
                    {(userProfile.points || 0) >= reward.points && (
                      <Check className="w-5 h-5 text-green-300" />
                    )}
                  </div>
                  <h4 className="font-semibold mb-1">{reward.name}</h4>
                  <p className="text-sm opacity-90">{reward.points} puntos</p>
                  {(userProfile.points || 0) < reward.points && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-semibold text-center px-2">
                        Necesitas {reward.points - (userProfile.points || 0)} puntos más
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de recompensas */}
      {showRewardsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto border border-slate-700/50 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-yellow-400" />
                  Todas las Recompensas
                </h3>
                <button 
                  onClick={() => setShowRewardsModal(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div 
                    key={reward.id}
                    className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                      (userProfile.points || 0) >= reward.points 
                        ? 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20' 
                        : 'border-slate-600/50 bg-slate-800/30 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${reward.color} shadow-lg`}>
                        {reward.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{reward.name}</h4>
                        <p className="text-slate-400">{reward.points} puntos requeridos</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRewardSelect(reward)}
                      disabled={(userProfile.points || 0) < reward.points}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        (userProfile.points || 0) >= reward.points
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 transform hover:scale-105 shadow-lg'
                          : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {(userProfile.points || 0) >= reward.points ? 'Canjear' : 'Bloqueado'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;