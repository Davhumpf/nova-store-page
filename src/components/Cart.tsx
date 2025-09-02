import React, { useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingCart, Sparkles, Crown, Trash2, Shield, UserPlus, LogIn, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const CartItem = memo(function CartItem({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: { id: string; name: string; description: string; imageUrl: string; price: number; quantity: number };
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-600">
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              decoding="async"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
              fetchPriority="low"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-semibold text-slate-200 text-sm leading-tight">
                {item.name}
              </h3>
              <p className="text-slate-400 text-xs mt-1 line-clamp-1">{item.description}</p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="w-7 h-7 bg-slate-700/60 hover:bg-red-500/20 border border-slate-600 hover:border-red-400 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Quitar del carrito"
            >
              <Trash2 size={14} className="text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-yellow-400">${item.price.toLocaleString('es-CO')}</p>
              <p className="text-xs text-slate-500">Total: ${(item.price * item.quantity).toLocaleString('es-CO')}</p>
            </div>

            <div className="flex items-center border border-slate-600 rounded-xl overflow-hidden">
              <button
                onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-yellow-400 hover:bg-slate-700/60"
                disabled={item.quantity <= 1}
                aria-label="Disminuir cantidad"
              >
                <Minus size={14} />
              </button>
              <div className="w-10 h-8 flex items-center justify-center bg-slate-800 text-yellow-400 font-bold text-sm">
                {item.quantity}
              </div>
              <button
                onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-yellow-400 hover:bg-slate-700/60"
                aria-label="Aumentar cantidad"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const Cart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    clearCart,
  } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const totalItems = useMemo(() => cartItems.reduce((s, it) => s + it.quantity, 0), [cartItems]);

  const generateWhatsAppMessage = useCallback(() => {
    const productLines = cartItems.map(
      (it) => `• ${it.name} x${it.quantity} - ${(it.price * it.quantity).toLocaleString('es-CO')}`
    );
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

Gracias.`;
  }, [cartItems, totalItems, cartTotal, user?.email]);

  const whatsappUrl = useMemo(
    () => `https://wa.me/573027214125?text=${encodeURIComponent(generateWhatsAppMessage())}`,
    [generateWhatsAppMessage]
  );

  const handleCheckout = useCallback(() => {
    if (!user) {
      navigate('/auth', { state: { returnToCheckout: true, defaultMode: 'login' } });
      setIsCartOpen(false);
      return;
    }
    // Abrir WhatsApp y limpiar
    window.open(whatsappUrl, '_blank');
    clearCart();
    setIsCartOpen(false);
  }, [user, navigate, setIsCartOpen, whatsappUrl, clearCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop ligero */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-slate-900 shadow-2xl border-l border-slate-700">

            {/* Header compacto */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={18} className="text-slate-900" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-yellow-400">Tu Carrito</h2>
                  {cartItems.length > 0 && (
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <Crown size={12} />
                      {cartItems.length} producto{cartItems.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 bg-slate-800/60 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center"
                aria-label="Cerrar carrito"
              >
                <X size={16} className="text-slate-300" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                    <ShoppingCart size={28} className="text-slate-500" />
                  </div>
                  <p className="text-yellow-400 text-base font-bold">Tu carrito está vacío</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Seguir explorando
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={removeFromCart}
                    onUpdateQty={updateQuantity}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-700 px-4 py-5 bg-slate-900/95">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-slate-400 text-sm">
                    Total ({totalItems}):{' '}
                    <span className="text-yellow-400 font-bold text-base">
                      ${cartTotal.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-green-400">
                      <Shield size={12} />
                      Garantía
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Sparkles size={12} />
                      Envío gratis
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    {user ? 'Finalizar compra' : 'Inicia sesión para comprar'}
                  </button>

                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-slate-800/60 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl font-semibold"
                  >
                    Seguir explorando
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
