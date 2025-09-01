import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingCart, Sparkles, Crown, Zap, Heart, Star, Rocket, Trash2, Bolt, Shield, UserPlus, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const Cart: React.FC = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    isCartOpen,
    setIsCartOpen,
    clearCart
  } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  if (!isCartOpen) return null;

  // Mensaje de WhatsApp profesional y estructurado
  const generateWhatsAppMessage = () => {
    const productLines = cartItems.map(item =>
      `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString('es-CO')}`
    );
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return `Hola, tengo interés en lo siguiente:

*DETALLE DEL PEDIDO*:
${productLines.join('\n')}

RESUMEN:
- Cantidad de productos: ${totalItems} item${totalItems > 1 ? 's' : ''}
- Total: $${cartTotal.toLocaleString('es-CO')}
- Email de usuario: ${user?.email || 'No especificado'}

Me gustaría conocer:
- Disponibilidad de los productos
- Métodos de pago disponibles

Quedo atento a su respuesta para proceder con la compra.

Muchas gracias por su atención.`;
  };

  const whatsappUrl = `https://wa.me/573027214125?text=${encodeURIComponent(generateWhatsAppMessage())}`;

  // Función para manejar el checkout con verificación de autenticación
  const handleCheckout = () => {
    if (!user) {
      // Si no hay usuario, mostrar opciones de autenticación
      setShowAuthPrompt(true);
      return;
    }

    // Si hay usuario, proceder con la compra
    setIsCheckingOut(true);
    
    // Abrir WhatsApp y limpiar carrito después
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      clearCart();
      setIsCartOpen(false);
      setIsCheckingOut(false);
    }, 1000);
  };

  // Funciones para manejar la navegación a auth - MEJORADAS
  const handleLogin = () => {
    setIsCartOpen(false);
    setShowAuthPrompt(false);
    // Navegar a /auth con estado que indique login
    navigate('/auth', { 
      state: { 
        returnToCheckout: true,
        defaultMode: 'login'
      } 
    });
  };

  const handleRegister = () => {
    setIsCartOpen(false);
    setShowAuthPrompt(false);
    // Navegar a /auth con estado que indique registro
    navigate('/auth', { 
      state: { 
        returnToCheckout: true,
        defaultMode: 'register'
      } 
    });
  };

  const closeAuthPrompt = () => {
    setShowAuthPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Enhanced Backdrop con efectos */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/95 to-slate-900/90 backdrop-blur-sm transition-all duration-500"
        onClick={() => {
          setIsCartOpen(false);
          setShowAuthPrompt(false);
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Cart Panel con diseño épico */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md transform transition-all duration-500 ease-out">
          <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-l border-yellow-400/20 relative overflow-hidden">
            
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent pointer-events-none"></div>

            {/* Header épico */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-yellow-400/30 bg-slate-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingCart size={20} className="text-slate-900" />
                  </div>
                  {cartItems.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-white text-xs font-bold">
                        {cartItems.length}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
                    Tu Carrito
                  </h2>
                  {cartItems.length > 0 && (
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <Crown size={12} />
                      {cartItems.length} producto{cartItems.length > 1 ? 's' : ''} premium
                    </p>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => setIsCartOpen(false)}
                className="group w-8 h-8 bg-slate-800/50 hover:bg-red-500/20 border border-slate-700 hover:border-red-400 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <X size={16} className="text-slate-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>

            {/* Cart Items con diseño mejorado */}
            <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center shadow-xl">
                      <ShoppingCart size={32} className="text-slate-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles size={16} className="text-slate-900" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-yellow-400 text-lg font-bold">¡Tu carrito está vacío!</p>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                      Descubre productos increíbles y empieza tu aventura de compras
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    <Rocket size={16} className="group-hover:rotate-12 transition-transform" />
                    <span>Explorar productos</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="group bg-gradient-to-r from-slate-800/50 to-slate-700/30 backdrop-blur-sm border border-slate-700/50 hover:border-yellow-400/50 rounded-2xl p-4 transition-all duration-300 hover:transform hover:scale-[1.02] relative overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      
                      <div className="flex gap-4 relative z-10">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-600 group-hover:border-yellow-400/50 transition-colors">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                            <Star size={8} className="text-slate-900 fill-current" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="font-bold text-slate-200 text-sm leading-tight group-hover:text-yellow-400 transition-colors">
                                {item.name}
                              </h3>
                              <p className="text-slate-400 text-xs mt-1 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 bg-slate-700/50 hover:bg-red-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 group/remove"
                            >
                              <Trash2 size={12} className="text-slate-400 group-hover/remove:text-white transition-colors" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-black text-yellow-400">
                                ${item.price.toLocaleString('es-CO')}
                              </p>
                              <p className="text-xs text-slate-500">
                                Total: ${(item.price * item.quantity).toLocaleString('es-CO')}
                              </p>
                            </div>
                            
                            <div className="flex items-center bg-slate-700/50 border border-slate-600 rounded-xl overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-yellow-400 hover:bg-slate-600 transition-all duration-200"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-10 h-8 flex items-center justify-center bg-slate-800 text-yellow-400 font-bold text-sm">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-yellow-400 hover:bg-slate-600 transition-all duration-200"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer/Checkout épico */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-700/50 px-6 py-6 bg-gradient-to-t from-slate-900 to-slate-800/50 backdrop-blur-sm relative">
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/5 to-transparent pointer-events-none"></div>
                
                {/* Total con efectos épicos */}
                <div className="relative bg-gradient-to-r from-slate-800/80 to-slate-700/60 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-yellow-400/30 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
                  
                  <div className="relative flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Crown size={16} className="text-yellow-400" />
                        <p className="text-slate-400 text-sm font-medium">
                          Total épico ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} productos)
                        </p>
                      </div>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
                        ${cartTotal.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                        <Zap size={12} />
                        <span>Envío gratis</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-400 text-xs font-medium">
                        <Shield size={12} />
                        <span>Garantizado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones épicos */}
                <div className="space-y-3 relative">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`group relative w-full overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 py-4 px-6 rounded-2xl font-black text-base transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed ${
                      isCheckingOut ? 'animate-pulse scale-95' : ''
                    }`}
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span>Procesando compra épica...</span>
                      </>
                    ) : user ? (
                      <>
                        <Rocket size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span>¡Finalizar Compra Épica!</span>
                        <Sparkles size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                      </>
                    ) : (
                      <>
                        <UserPlus size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span>Continuar Compra</span>
                        <Sparkles size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                      </>
                    )}
                    
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                  
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-yellow-400/50 text-slate-300 hover:text-yellow-400 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Heart size={16} />
                    <span>Seguir explorando</span>
                  </button>
                </div>
                
                {/* Mensaje motivacional */}
                <div className="text-center mt-4">
                  <div className="inline-flex items-center gap-2 bg-slate-800/30 backdrop-blur-sm border border-yellow-400/20 rounded-xl px-3 py-1.5 text-yellow-400 text-xs font-medium">
                    <Bolt size={12} className="animate-pulse" />
                    <span>✨ Compra segura y entrega inmediata ✨</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de autenticación */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAuthPrompt} />
          
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-yellow-400/30 p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in duration-300">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
                <UserPlus size={24} className="text-slate-900" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                  ¡Casi listo!
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Para finalizar tu compra necesitas tener una cuenta. Es rápido y gratis.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRegister}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} />
                  Crear cuenta gratis
                </button>
                
                <button
                  onClick={handleLogin}
                  className="w-full bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-yellow-400/50 text-slate-300 hover:text-yellow-400 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  Ya tengo cuenta
                </button>
              </div>

              <button
                onClick={closeAuthPrompt}
                className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                Continuar sin cuenta (solo navegación)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;