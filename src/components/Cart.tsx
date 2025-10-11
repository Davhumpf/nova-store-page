// src/components/Cart.tsx
import React, { useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Sparkles,
  Crown,
  Trash2,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

type CartItemType = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  quantity: number;
};

const CartItem = memo(function CartItem({
  item,
  onRemove,
  onUpdateQty,
  currency,
}: {
  item: CartItemType;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  currency: (n: number) => string;
}) {
  const decrease = () => onUpdateQty(item.id, Math.max(1, item.quantity - 1));
  const increase = () => onUpdateQty(item.id, item.quantity + 1);

  return (
    <div className="bg-[#F5F5F5] dark:bg-gray-800 border border-[#D0D0D0] dark:border-gray-700 rounded-lg p-3.5 sm:p-4">
      <div className="flex gap-3.5">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#D0D0D0] dark:border-gray-700 bg-white dark:bg-gray-700">
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
              <h3 className="font-semibold text-[#2A2A2A] dark:text-white text-sm leading-tight truncate">
                {item.name}
              </h3>
              <p className="text-[#8A8A8A] dark:text-gray-400 text-xs mt-1 line-clamp-1">{item.description}</p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="w-7 h-7 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 border border-[#D0D0D0] dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 rounded-lg grid place-items-center transition-colors"
              aria-label={`Quitar ${item.name} del carrito`}
            >
              <Trash2 size={14} className="text-[#8A8A8A] dark:text-gray-400 hover:text-red-500" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-[#4CAF50] dark:text-[#66FF7A]">{currency(item.price)}</p>
              <p className="text-xs text-[#8A8A8A] dark:text-gray-400">
                Total: {currency(item.price * item.quantity)}
              </p>
            </div>

            <div className="flex items-center border border-[#D0D0D0] dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={decrease}
                className="w-8 h-8 grid place-items-center text-[#8A8A8A] dark:text-gray-400 hover:text-[#4CAF50] dark:hover:text-[#66FF7A] hover:bg-[#F5F5F5] dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                disabled={item.quantity <= 1}
                aria-label="Disminuir cantidad"
              >
                <Minus size={14} />
              </button>
              <div className="min-w-10 px-2 h-8 grid place-items-center bg-white dark:bg-gray-800 text-[#4CAF50] dark:text-[#66FF7A] font-bold text-sm tabular-nums">
                {item.quantity}
              </div>
              <button
                onClick={increase}
                className="w-8 h-8 grid place-items-center text-[#8A8A8A] dark:text-gray-400 hover:text-[#4CAF50] dark:hover:text-[#66FF7A] hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors"
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

  // formateador de moneda memoizado
  const currency = useMemo(() => {
    const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    return (n: number) => fmt.format(n);
  }, []);

  const totalItems = useMemo(
    () => cartItems.reduce((s, it) => s + it.quantity, 0),
    [cartItems]
  );

  // Handlers memoizados (no recrean funciones para cada item)
  const handleRemove = useCallback((id: string) => removeFromCart(id), [removeFromCart]);
  const handleUpdateQty = useCallback(
    (id: string, qty: number) => updateQuantity(id, qty),
    [updateQuantity]
  );

  const generateWhatsAppMessage = useCallback(() => {
    const productLines = cartItems.map(
      (it) => `• ${it.name} x${it.quantity} - ${currency(it.price * it.quantity)}`
    );
    return `Hola, tengo interés en lo siguiente:

*DETALLE DEL PEDIDO*:
${productLines.join('\n')}

RESUMEN:
- Cantidad de productos: ${totalItems} item${totalItems > 1 ? 's' : ''}
- Total: ${currency(cartTotal)}
- Email de usuario: ${user?.email || 'No especificado'}

Me gustaría conocer:
- Disponibilidad de los productos
- Métodos de pago disponibles

Gracias.`;
  }, [cartItems, totalItems, cartTotal, user?.email, currency]);

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
    window.open(whatsappUrl, '_blank');
    clearCart();
    setIsCartOpen(false);
  }, [user, navigate, setIsCartOpen, whatsappUrl, clearCart]);

  // Accesibilidad: foco y cierre con ESC, bloqueo del scroll body
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!isCartOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // foco al botón cerrar
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[1px]"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Panel (full en móvil, 420px en desktop) */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-full sm:max-w-md">
          <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-2xl border-l border-[#D0D0D0] dark:border-gray-700">

            {/* Header compacto */}
            <div className="flex items-center justify-between px-3.5 sm:px-4 py-3 border-b border-[#D0D0D0] dark:border-gray-700 bg-[#F5F5F5] dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#4CAF50] dark:bg-[#66FF7A] rounded-lg grid place-items-center">
                  <ShoppingCart size={18} className="text-white dark:text-gray-900" />
                </div>
                <div className="min-w-0">
                  <h2 id="cart-title" className="text-base sm:text-lg font-bold text-[#4CAF50] dark:text-[#66FF7A] truncate">
                    Tu Carrito
                  </h2>
                  {cartItems.length > 0 && (
                    <p className="text-[#8A8A8A] dark:text-gray-400 text-[11px] sm:text-xs flex items-center gap-1">
                      <Crown size={12} />
                      {cartItems.length} producto{cartItems.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <button
                ref={closeBtnRef}
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 bg-white dark:bg-gray-700 hover:bg-[#F5F5F5] dark:hover:bg-gray-600 border border-[#D0D0D0] dark:border-gray-600 rounded-lg grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50]/40 dark:focus-visible:ring-[#66FF7A]/40"
                aria-label="Cerrar carrito"
              >
                <X size={16} className="text-[#2A2A2A] dark:text-white" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3.5 sm:px-4 space-y-3 bg-[#E8E8E8] dark:bg-gray-950">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-[#F5F5F5] dark:bg-gray-800 rounded-full grid place-items-center border border-[#D0D0D0] dark:border-gray-700">
                    <ShoppingCart size={28} className="text-[#8A8A8A] dark:text-gray-400" />
                  </div>
                  <p className="text-[#4CAF50] dark:text-[#66FF7A] text-base font-bold">Tu carrito está vacío</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-[#4CAF50] dark:bg-[#66FF7A] hover:bg-[#45a049] dark:hover:bg-[#4CAF50] text-white dark:text-gray-900 px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
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
                    onRemove={handleRemove}
                    onUpdateQty={handleUpdateQty}
                    currency={currency}
                  />
                ))
              )}
            </div>

            {/* Footer sticky */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#D0D0D0] dark:border-gray-700 px-3.5 sm:px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[#8A8A8A] dark:text-gray-400 text-sm">
                    Total ({totalItems}):{' '}
                    <span className="text-[#4CAF50] dark:text-[#66FF7A] font-bold text-base tabular-nums">
                      {currency(cartTotal)}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-green-500 dark:text-green-400">
                      <Shield size={12} />
                      Garantía
                    </div>
                    <div className="flex items-center gap-1 text-[#8A8A8A] dark:text-gray-400">
                      <Sparkles size={12} />
                      Envío gratis
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#4CAF50] dark:bg-[#66FF7A] hover:bg-[#45a049] dark:hover:bg-[#4CAF50] text-white dark:text-gray-900 py-3 rounded-lg font-bold flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50]/40 dark:focus-visible:ring-[#66FF7A]/40 transition-colors"
                  >
                    <ShoppingCart size={18} />
                    {user ? 'Finalizar compra' : 'Inicia sesión para comprar'}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full bg-[#F5F5F5] dark:bg-gray-800 hover:bg-[#E8E8E8] dark:hover:bg-gray-700 text-[#2A2A2A] dark:text-white py-2.5 rounded-lg font-semibold border border-[#D0D0D0] dark:border-gray-700 transition-colors"
                    >
                      Seguir explorando
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full bg-[#F5F5F5] dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 py-2.5 rounded-lg font-semibold border border-red-300 dark:border-red-800 transition-colors"
                    >
                      Vaciar
                    </button>
                  </div>
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