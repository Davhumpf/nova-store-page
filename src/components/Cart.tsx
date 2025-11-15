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
    <div className="border border-primary rounded-lg  bg-white dark:bg-gray-800 rounded-lg p-3.5 sm:p-4 group hover: transition-all animate-scale-in">
      <div className="flex gap-3.5 relative z-10">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-primary rounded-lg-light bg-white dark:bg-gray-700">
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
              className="w-7 h-7 bg-accent-error hover:bg-red-600 border-2 border-black dark:border-white rounded-lg grid place-items-center transition-all hover:scale-110"
              aria-label={`Quitar ${item.name} del carrito`}
            >
              <Trash2 size={14} className="text-white" />
            </button>
          </div>

          {/* Stipple pattern divider */}
          <div className=" h-px my-2 text-gray-400 dark:text-gray-600"></div>

          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-accent-primary title-shadow text-base">{currency(item.price)}</p>
              <p className="text-xs text-accent-primary font-semibold">
                Total: {currency(item.price * item.quantity)}
              </p>
            </div>

            <div className="flex items-center border border-primary rounded-lg-light rounded-lg overflow-hidden bg-white dark:bg-gray-900">
              <button
                onClick={decrease}
                className="w-8 h-8 grid place-items-center text-[#8A8A8A] dark:text-gray-400 hover:text-accent-error hover:bg-[#F5F5F5] dark:hover:bg-gray-700 disabled:opacity-40 transition-all disabled:cursor-not-allowed"
                disabled={item.quantity <= 1}
                aria-label="Disminuir cantidad"
              >
                <Minus size={14} />
              </button>
              <div className="min-w-10 px-2 h-8 grid place-items-center bg-white dark:bg-black border-2 border-black dark:border-white text-accent-primary font-bold text-sm tabular-nums">
                {item.quantity}
              </div>
              <button
                onClick={increase}
                className="w-8 h-8 grid place-items-center text-[#8A8A8A] dark:text-gray-400 hover:text-accent-success hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-all"
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
          <div className="h-full flex flex-col classic-card  bg-white dark:bg-gray-900 shadow-2xl">

            {/* Header compacto */}
            <div className="flex items-center justify-between px-3.5 sm:px-4 py-3 border border-primary rounded-lg-light bg-white dark:bg-black border-b-4 border-black dark:border-white relative overflow-hidden">
              <div className=" absolute inset-0 opacity-10 text-black dark:text-white"></div>
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-9 h-9 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg grid place-items-center border border-primary rounded-lg-light">
                  <ShoppingCart size={18} className="text-accent-primary" />
                </div>
                <div className="min-w-0">
                  <h2 id="cart-title" className="text-base sm:text-lg font-bold text-black  truncate">
                    Tu Carrito
                  </h2>
                  {cartItems.length > 0 && (
                    <p className="text-black text-[11px] sm:text-xs flex items-center gap-1 font-semibold">
                      <Crown size={12} />
                      {cartItems.length} producto{cartItems.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <button
                ref={closeBtnRef}
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 bg-accent-error hover:bg-red-600 border border-primary rounded-lg-light rounded-lg grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-error/40 transition-all hover:scale-110 relative z-10"
                aria-label="Cerrar carrito"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3.5 sm:px-4 space-y-3 bg-white dark:bg-black relative">
              <div className=" absolute inset-0 text-accent-primary opacity-10 pointer-events-none"></div>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 relative z-10">
                  <div className="w-16 h-16 bg-white dark:bg-black border-4 border-black dark:border-white rounded-full grid place-items-center border border-primary rounded-lg-light  shadow-classic-md">
                    <ShoppingCart size={28} className="text-accent-primary" />
                  </div>
                  <p className="text-accent-error text-base font-bold title-shadow">Tu carrito está vacío</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="classic-btn bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-classic-md"
                  >
                    <ChevronLeft size={16} className="text-accent-success" />
                    Seguir explorando
                  </button>
                </div>
              ) : (
                <div className="relative z-10">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={handleRemove}
                      onUpdateQty={handleUpdateQty}
                      currency={currency}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer sticky */}
            {cartItems.length > 0 && (
              <div className="border border-primary rounded-lg-light px-3.5 sm:px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] bg-white dark:bg-black border-t-4 border-black dark:border-white relative overflow-hidden">
                <div className=" absolute inset-0 text-black dark:text-white opacity-10 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="text-black dark:text-white text-sm font-bold">
                    Total ({totalItems}):{' '}
                    <span className="text-accent-primary dark:text-accent-primary title-shadow text-xl tabular-nums">
                      {currency(cartTotal)}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1 text-accent-success dark:text-accent-primary">
                      <Shield size={12} />
                      Garantía
                    </div>
                    <div className="flex items-center gap-1 text-black dark:text-white">
                      <Sparkles size={12} />
                      Envío gratis
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 relative z-10">
                  <button
                    onClick={handleCheckout}
                    className="classic-btn w-full bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-success/40 uppercase shadow-classic-md"
                  >
                    <ShoppingCart size={18} className="text-accent-success" />
                    {user ? 'Finalizar compra' : 'Inicia sesión'}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="classic-btn w-full bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white py-2.5 rounded-lg font-semibold text-sm shadow-classic-md"
                    >
                      Explorar
                    </button>
                    <button
                      onClick={clearCart}
                      className="classic-btn w-full bg-white dark:bg-black border-4 border-black dark:border-white text-accent-error py-2.5 rounded-lg font-semibold text-sm shadow-classic-md"
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