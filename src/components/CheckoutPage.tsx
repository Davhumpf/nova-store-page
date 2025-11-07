import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Camera, CheckCircle, FileImage, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const CheckoutPage: React.FC = () => {
  const { cartItems } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [whatsappNumber] = useState('+57 3027214125'); // Configura tu número de WhatsApp aquí
  
  // Verificar si el usuario está autenticado
  React.useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { redirect: '/checkout' } });
    }
  }, [user, navigate]);
  
  // Si no hay items en el carrito, redirigir a la página principal
  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);
  
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Manejar el avance en los pasos
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Generar mensaje de WhatsApp
  const generateWhatsAppMessage = () => {
    const productsList = cartItems.map(item => `${item.name} (${item.quantity})`).join(', ');
    return `Hola, quiero comprar: ${productsList}. Mi correo es: ${user?.email}`;
  };
  
  // Redirigir a WhatsApp
  const redirectToWhatsApp = () => {
    const message = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };
  
  if (!user || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-[#4CAF50] dark:border-[#66FF7A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F2F2F2] dark:bg-gray-900 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-none overflow-hidden border border-[#A6A6A6]/20 dark:border-gray-700">
          <div className="bg-[#4CAF50] dark:bg-[#66FF7A] py-4">
            <h1 className="text-2xl font-bold text-center text-white dark:text-gray-900">Finalizar Compra</h1>
          </div>
          
          {/* Pasos del proceso */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step === currentStep
                        ? 'bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900'
                        : step < currentStep
                          ? 'bg-[#4CAF50] dark:bg-[#66FF7A] text-white dark:text-gray-900'
                          : 'bg-[#A6A6A6]/30 dark:bg-gray-700 text-[#595959] dark:text-gray-400'
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircle size={20} />
                    ) : (
                      <span className="font-bold">{step}</span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${step === currentStep ? 'text-[#4CAF50] dark:text-[#66FF7A]' : 'text-[#595959] dark:text-gray-400'}`}>
                    {step === 1 && "Verificar productos"}
                    {step === 2 && "Capturar pantalla"}
                    {step === 3 && "Completar en WhatsApp"}
                  </p>
                </div>
              ))}
            </div>

            {/* Contenido según el paso actual */}
            <div className="bg-[#F2F2F2] dark:bg-gray-700 rounded-lg p-6 border border-[#A6A6A6]/20 dark:border-gray-600">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-white mb-4">Resumen del pedido</h2>

                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-[#A6A6A6]/10 dark:border-gray-700">
                        <div className="w-16 h-16 rounded-lg bg-[#F2F2F2] dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingCart size={24} className="text-[#4CAF50] dark:text-[#66FF7A]" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-[#0D0D0D] dark:text-white font-medium">{item.name}</h3>
                          <p className="text-[#595959] dark:text-gray-400 text-sm">Cantidad: {item.quantity}</p>
                        </div>

                        <div className="text-[#4CAF50] dark:text-[#66FF7A] font-bold">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-[#A6A6A6]/10 dark:border-gray-700">
                    <span className="text-[#0D0D0D] dark:text-white font-medium">Total a pagar:</span>
                    <span className="text-[#4CAF50] dark:text-[#66FF7A] font-bold text-xl">${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleNextStep}
                      className="w-full bg-[#4CAF50] dark:bg-[#66FF7A] hover:bg-[#66FF7A] dark:hover:bg-[#4CAF50] text-white dark:text-gray-900 rounded-lg py-3 font-medium flex items-center justify-center gap-2 transition-all shadow-md dark:shadow-none"
                    >
                      <span>Continuar</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-white mb-4">Captura de pantalla</h2>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6 border border-[#A6A6A6]/10 dark:border-gray-700">
                    <div className="flex items-center justify-center mb-4">
                      <Camera size={48} className="text-[#4CAF50] dark:text-[#66FF7A]" />
                    </div>

                    <div className="space-y-4">
                      <p className="text-[#0D0D0D] dark:text-white text-center">
                        Toma una captura de pantalla de este pedido para continuar con tu compra.
                      </p>

                      <div className="bg-[#F2F2F2] dark:bg-gray-700 p-4 rounded-lg border border-dashed border-[#A6A6A6] dark:border-gray-600">
                        <div className="flex items-center justify-center gap-3 text-[#595959] dark:text-gray-400">
                          <FileImage size={20} />
                          <span>Toma una captura con los productos que deseas comprar</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#4CAF50]/10 dark:bg-[#66FF7A]/20 rounded-lg border border-[#4CAF50]/30 dark:border-[#66FF7A]/30 mb-6">
                    <p className="text-[#4CAF50] dark:text-[#66FF7A] text-sm">
                      Para completar tu compra necesitarás enviar una captura de pantalla con el detalle de este pedido a nuestro WhatsApp.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleNextStep}
                      className="w-full bg-[#4CAF50] dark:bg-[#66FF7A] hover:bg-[#66FF7A] dark:hover:bg-[#4CAF50] text-white dark:text-gray-900 rounded-lg py-3 font-medium flex items-center justify-center gap-2 transition-all shadow-md dark:shadow-none"
                    >
                      <span>Ya tomé mi captura</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-white mb-4">Completar en WhatsApp</h2>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6 border border-[#A6A6A6]/10 dark:border-gray-700">
                    <div className="flex items-center justify-center mb-4">
                      <MessageSquare size={48} className="text-[#4CAF50] dark:text-[#66FF7A]" />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[#0D0D0D] dark:text-white text-lg font-medium text-center">Instrucciones finales:</h3>

                      <ol className="list-decimal list-inside space-y-3 pl-4 text-[#0D0D0D] dark:text-white">
                        <li>Haz clic en el botón "Continuar en WhatsApp"</li>
                        <li>Envía la captura de pantalla que tomaste</li>
                        <li>Menciona el correo con el que estás registrado: <span className="bg-[#F2F2F2] dark:bg-gray-700 px-2 py-1 rounded text-[#4CAF50] dark:text-[#66FF7A]">{user.email}</span></li>
                        <li>Solicita los métodos de pago disponibles</li>
                        <li>Una vez verificado el pago, se añadirán los puntos a tu cuenta</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-4 bg-[#4CAF50]/10 dark:bg-[#66FF7A]/20 rounded-lg border border-[#4CAF50]/30 dark:border-[#66FF7A]/30 mb-6">
                    <p className="text-[#4CAF50] dark:text-[#66FF7A] text-sm">
                      Por cada compra realizada acumularás puntos en tu cuenta que podrás utilizar en futuras compras.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={redirectToWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#1da851] text-white rounded-lg py-3 font-medium flex items-center justify-center gap-2 transition-all shadow-md dark:shadow-none"
                    >
                      <MessageSquare size={18} />
                      <span>Continuar en WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;