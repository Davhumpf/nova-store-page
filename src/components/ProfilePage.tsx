import React, { useState, useEffect } from 'react';
import { User, Camera, UploadCloud, Award, Loader, Edit3, Save, X, Gift, Star, TrendingUp, Calendar, MessageCircle, Crown, Trophy, Target, Coins, Sparkles, Check } from 'lucide-react';
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
    if (!user) window.location.href = '/auth';
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
      
      await updateProfile(user, { photoURL });
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

  const handleSave = async () => {
    try {
      setIsEditing(false);
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
    if (points >= 2000) return { level: 'Platino', color: 'from-[#A6A6A6] to-[#595959]', icon: <Crown className="w-5 h-5" /> };
    if (points >= 1000) return { level: 'Oro', color: 'from-[#4CAF50] to-[#66FF7A]', icon: <Trophy className="w-5 h-5" /> };
    if (points >= 500) return { level: 'Plata', color: 'from-[#BA68C8] to-[#E1BEE7]', icon: <Star className="w-5 h-5" /> };
    return { level: 'Bronce', color: 'from-[#4FC3F7] to-[#81D4FA]', icon: <Target className="w-5 h-5" /> };
  };

  const rewards = [
    { id: 1, name: 'Descuento 10%', points: 500, icon: <Gift className="w-6 h-6" />, color: 'from-[#4FC3F7] to-[#81D4FA]' },
    { id: 2, name: 'Descuento 25%', points: 1000, icon: <Star className="w-6 h-6" />, color: 'from-[#BA68C8] to-[#E1BEE7]' },
    { id: 3, name: 'Producto Gratis', points: 1500, icon: <Crown className="w-6 h-6" />, color: 'from-[#4CAF50] to-[#66FF7A]' },
    { id: 4, name: '3 meses gratis', points: 2000, icon: <Sparkles className="w-6 h-6" />, color: 'from-[#0D0D0D] to-[#262626]' }
  ];

  const handleRewardSelect = (reward: any) => {
    const points = userProfile?.points || 0;
    if (points >= reward.points) {
      const message = encodeURIComponent(`¡Hola! Quiero canjear: ${reward.name} (${reward.points} pts). Tengo ${points} puntos.`);
      window.open(`https://wa.me/573027214125?text=${message}`, '_blank');
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4CAF50] dark:border-[#66FF7A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#595959] dark:text-gray-400 font-light">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const userLevel = getUserLevel(userProfile.points || 0);
  const daysAsMember = calculateDaysAsMember();

  const userStats = [
    { label: 'Puntos', value: userProfile.points || 0, icon: <Coins className="w-5 h-5" />, color: 'text-[#4CAF50]' },
    { label: 'Compras', value: userProfile.totalPurchases || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'text-[#4FC3F7]' },
    { label: 'Recompensas', value: userProfile.rewardsRedeemed || 0, icon: <Trophy className="w-5 h-5" />, color: 'text-[#BA68C8]' },
    { label: 'Días miembro', value: daysAsMember, icon: <Calendar className="w-5 h-5" />, color: 'text-[#595959]' }
  ];

  return (
    <div className="min-h-screen halftone-pattern py-6 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black comic-text-shadow text-[#0D0D0D] dark:text-white mb-2">Mi Perfil</h1>
          <p className="text-[#595959] dark:text-gray-400 font-bold">Gestiona tu cuenta y recompensas</p>
        </div>

        {/* Tarjeta principal */}
        <div className="comic-panel overflow-hidden mb-6 animate-comic-pop">
          <div className="bg-gradient-to-r from-[#FF1493] to-[#FFD700] p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">

              {/* Foto perfil */}
              <div className="relative group">
                <div className="relative comic-border">
                  {userProfile.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Perfil"
                      className="w-28 h-28 rounded-full object-cover border-4 border-[#0D0D0D] dark:border-white shadow-lg transform group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center border-4 border-[#0D0D0D] dark:border-white shadow-lg">
                      <User size={40} className="text-[#0D0D0D] dark:text-white" />
                    </div>
                  )}
                  
                  {isUploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/70">
                      <Loader size={20} className="text-white animate-spin" />
                      <span className="text-xs text-white mt-1">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <label 
                      htmlFor="profile-photo" 
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/50 cursor-pointer transition-all duration-300"
                    >
                      <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  className="mt-3 text-white text-sm font-medium flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors justify-center"
                >
                  <UploadCloud size={14} />
                  Cambiar foto
                </label>
              </div>

              {/* Info usuario */}
              <div className="flex-1 text-[#0D0D0D] dark:text-white text-center md:text-left">
                <h2 className="text-2xl font-black comic-text-shadow mb-1">
                  {userProfile.displayName || user.email?.split('@')[0] || 'Usuario'}
                </h2>
                <p className="text-[#0D0D0D]/80 dark:text-white/80 mb-3 text-sm font-bold">{user.email}</p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00CED1] to-[#FF69B4] text-[#0D0D0D] dark:text-white font-black shadow-lg text-sm comic-border">
                  {userLevel.icon}
                  <span>Nivel {userLevel.level}</span>
                </div>
              </div>

              {/* Puntos */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] backdrop-blur-sm rounded-xl p-4 border-4 border-[#0D0D0D] dark:border-white comic-border">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-[#0D0D0D] dark:text-white" />
                    <span className="text-[#0D0D0D] dark:text-white font-black text-sm">Puntos</span>
                  </div>
                  <div className="text-3xl font-black comic-text-shadow text-[#0D0D0D] dark:text-white">{userProfile.points || 0}</div>
                  <button
                    onClick={handleRedeemPoints}
                    className="comic-button mt-3 px-5 py-2 flex items-center gap-2 mx-auto text-sm"
                  >
                    <MessageCircle size={14} />
                    Redimir
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bendaydots-pattern p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {userStats.map((stat, index) => (
                <div key={index} className="comic-panel p-4 text-center hover:shadow-md dark:hover:shadow-none transition-all duration-200 animate-comic-pop bg-gradient-to-br from-[#4ECDC4] to-[#FF6B6B]">
                  <div className="text-[#0D0D0D] dark:text-white mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-black comic-text-shadow text-[#0D0D0D] dark:text-white">{stat.value}</div>
                  <div className="text-xs text-[#0D0D0D] dark:text-white font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información personal */}
        <div className="comic-panel p-5 mb-6 animate-comic-pop">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black comic-text-shadow text-[#0D0D0D] dark:text-white">Información Personal</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="comic-button flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Edit3 size={14} />
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="comic-button flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[#4ECDC4] to-[#44A08D]"
                >
                  <Save size={14} />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="comic-button flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[#FF6B6B] to-[#EE5A6F]"
                >
                  <X size={14} />
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0D0D0D] dark:text-white mb-2">Email</label>
              <div className="comic-input px-4 py-3 text-sm">{user.email}</div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0D0D0D] dark:text-white mb-2">Nombre</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.displayName}
                  onChange={(e) => setTempProfile({...tempProfile, displayName: e.target.value})}
                  className="comic-input w-full px-4 py-3 text-sm"
                  placeholder="Tu nombre"
                />
              ) : (
                <div className="comic-input px-4 py-3 text-sm">
                  {userProfile.displayName || tempProfile.displayName || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0D0D0D] dark:text-white mb-2">Teléfono</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                  className="comic-input w-full px-4 py-3 text-sm"
                  placeholder="+57 300 123 4567"
                />
              ) : (
                <div className="comic-input px-4 py-3 text-sm">
                  {userProfile.phone || tempProfile.phone || 'No especificado'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0D0D0D] dark:text-white mb-2">Fecha de nacimiento</label>
              {isEditing ? (
                <input
                  type="date"
                  value={tempProfile.birthDate}
                  onChange={(e) => setTempProfile({...tempProfile, birthDate: e.target.value})}
                  className="comic-input w-full px-4 py-3 text-sm"
                />
              ) : (
                <div className="comic-input px-4 py-3 text-sm">
                  {userProfile.birthDate || tempProfile.birthDate || 'No especificado'}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#0D0D0D] dark:text-white mb-2">Categoría favorita</label>
              {isEditing ? (
                <select
                  value={tempProfile.favoriteCategory}
                  onChange={(e) => setTempProfile({...tempProfile, favoriteCategory: e.target.value})}
                  className="comic-input w-full px-4 py-3 text-sm"
                >
                  <option value="streaming">Streaming</option>
                  <option value="gaming">Gaming</option>
                  <option value="music">Música</option>
                  <option value="software">Software</option>
                  <option value="education">Educación</option>
                </select>
              ) : (
                <div className="comic-input px-4 py-3 capitalize text-sm">
                  {userProfile.favoriteCategory || tempProfile.favoriteCategory}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recompensas */}
        <div className="comic-panel p-5 animate-comic-pop">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black comic-text-shadow text-[#0D0D0D] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF1493] dark:text-[#FFD700]" />
              Recompensas
            </h3>
            <button
              onClick={() => setShowRewardsModal(true)}
              className="comic-button px-4 py-2 text-sm"
            >
              Ver todas
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`relative group comic-panel p-4 cursor-pointer transition-all duration-200 bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] ${
                  (userProfile.points || 0) >= reward.points ? 'transform hover:scale-105 shadow-md hover:shadow-lg' : 'opacity-50'
                }`}
                onClick={() => handleRewardSelect(reward)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[#0D0D0D] dark:text-white">{reward.icon}</div>
                  {(userProfile.points || 0) >= reward.points && (
                    <Check className="w-5 h-5 text-[#0D0D0D] dark:text-white" />
                  )}
                </div>
                <h4 className="font-black text-[#0D0D0D] dark:text-white mb-1 text-sm">{reward.name}</h4>
                <p className="text-xs font-bold text-[#0D0D0D] dark:text-white">{reward.points} pts</p>
                {(userProfile.points || 0) < reward.points && (
                  <div className="absolute inset-0 bg-black/40 dark:bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white text-center px-2">
                      Faltan {reward.points - (userProfile.points || 0)} pts
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showRewardsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="comic-panel max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black comic-text-shadow text-[#0D0D0D] dark:text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#FF1493] dark:text-[#FFD700]" />
                  Todas las Recompensas
                </h3>
                <button
                  onClick={() => setShowRewardsModal(false)}
                  className="text-[#0D0D0D] dark:text-white hover:text-[#FF1493] dark:hover:text-[#FFD700] transition-colors p-1"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`flex items-center justify-between p-4 comic-panel transition-all duration-200 ${
                      (userProfile.points || 0) >= reward.points
                        ? 'bg-gradient-to-r from-[#4ECDC4] to-[#44A08D]'
                        : 'bg-gradient-to-r from-[#A6A6A6] to-[#595959] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] shadow-md dark:shadow-none comic-border">
                        <div className="text-[#0D0D0D] dark:text-white">{reward.icon}</div>
                      </div>
                      <div>
                        <h4 className="font-black text-[#0D0D0D] dark:text-white text-sm">{reward.name}</h4>
                        <p className="text-[#0D0D0D] dark:text-white text-xs font-bold">{reward.points} puntos</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRewardSelect(reward)}
                      disabled={(userProfile.points || 0) < reward.points}
                      className={`comic-button px-4 py-2 text-sm ${
                        (userProfile.points || 0) >= reward.points
                          ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D]'
                          : 'opacity-50 cursor-not-allowed'
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