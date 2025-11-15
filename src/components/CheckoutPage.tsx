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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black  relative">
        <div className=" absolute inset-0 text-accent-primary opacity-10 pointer-events-none"></div>
        <div className="classic-card bg-white dark:bg-black border-4 border-black dark:border-white p-8 rounded-lg relative z-10  shadow-classic-lg">
          <div className="w-16 h-16 border-4 border border-primary rounded-lg-light border-accent-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-10 px-4  relative">
      <div className=" absolute inset-0 text-accent-primary opacity-10 pointer-events-none"></div>
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="classic-card  bg-white dark:bg-black border-4 border-black dark:border-white rounded-lg overflow-hidden animate-scale-in shadow-classic-lg">
          <div className="bg-white dark:bg-black border-b-4 border-black dark:border-white py-4 relative overflow-hidden">
            <div className=" absolute inset-0 text-black dark:text-white opacity-10"></div>
            <h1 className="text-2xl font-bold text-center text-accent-primary  relative z-10 uppercase">Finalizar Compra</h1>
          </div>
          
          {/* Pasos del proceso */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border border-primary rounded-lg-light font-bold transition-all border-4 border-black dark:border-white ${
                      step === currentStep
                        ? 'bg-white dark:bg-black text-accent-success  shadow-classic-md'
                        : step < currentStep
                          ? 'bg-white dark:bg-black text-accent-primary shadow-classic-md'
                          : 'bg-white dark:bg-black text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircle size={20} />
                    ) : (
                      <span className="font-bold">{step}</span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm font-semibold ${step === currentStep ? 'text-accent-success dark:text-accent-primary' : 'text-gray-600 dark:text-gray-400'}`}>
                    {step === 1 && "Verificar productos"}
                    {step === 2 && "Capturar pantalla"}
                    {step === 3 && "Completar en WhatsApp"}
                  </p>
                </div>
              ))}
            </div>

            {/* Contenido según el paso actual */}
            <div className="classic-card  bg-white dark:bg-black border-4 border-black dark:border-white rounded-lg p-6 relative overflow-hidden shadow-classic-lg">
              {currentStep === 1 && (
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-accent-error dark:text-accent-primary mb-4 title-shadow uppercase">Resumen del pedido</h2>

                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 border border-primary rounded-lg bg-white dark:bg-black border-2 border-black dark:border-white p-4 rounded-lg  hover: transition-all shadow-classic-md">
                        <div className="w-16 h-16 rounded-lg border border-primary rounded-lg-light bg-white dark:bg-black border-2 border-black dark:border-white flex items-center justify-center flex-shrink-0 overflow-hidden relative z-10">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingCart size={24} className="text-accent-primary" />
                          )}
                        </div>

                        <div className="flex-1 relative z-10">
                          <h3 className="text-black dark:text-white font-bold">{item.name}</h3>
                          <p className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Cantidad: {item.quantity}</p>
                        </div>

                        <div className="text-accent-primary dark:text-accent-primary font-bold text-lg title-shadow relative z-10">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-4 border border-primary rounded-lg bg-white dark:bg-black border-4 border-black dark:border-white rounded-lg relative overflow-hidden shadow-classic-md">
                    <div className=" absolute inset-0 text-black dark:text-white opacity-10 pointer-events-none"></div>
                    <span className="text-black dark:text-white font-bold relative z-10">Total a pagar:</span>
                    <span className="text-accent-primary dark:text-accent-primary font-bold text-2xl title-shadow relative z-10">${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleNextStep}
                      className="classic-btn w-full bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white rounded-lg py-3 font-bold flex items-center justify-center gap-2 uppercase shadow-classic-lg"
                    >
                      <span>Continuar</span>
                      <ArrowRight size={18} className="text-accent-success" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-accent-primary dark:text-accent-primary mb-4 title-shadow uppercase">Captura de pantalla</h2>

                  <div className="border border-primary rounded-lg bg-white dark:bg-black border-4 border-black dark:border-white p-6 rounded-lg mb-6  relative overflow-hidden shadow-classic-lg">
                    <div className="flex items-center justify-center mb-4 relative z-10">
                      <div className="bg-white dark:bg-black border-4 border-black dark:border-white rounded-full p-4 border border-primary rounded-lg-light  shadow-classic-lg">
                        <Camera size={48} className="text-accent-primary" />
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <p className="text-black dark:text-white text-center font-bold text-lg">
                        Toma una captura de pantalla de este pedido para continuar con tu compra.
                      </p>

                      <div className="border border-primary rounded-lg bg-white dark:bg-black border-4 border-black dark:border-white p-4 rounded-lg relative overflow-hidden shadow-classic-md">
                        <div className=" absolute inset-0 text-black dark:text-white opacity-10"></div>
                        <div className="flex items-center justify-center gap-3 text-black dark:text-white font-semibold relative z-10">
                          <FileImage size={20} className="text-accent-primary" />
                          <span>Toma una captura con los productos que deseas comprar</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-primary rounded-lg bg-white dark:bg-black border-4 border-black dark:border-white rounded-lg mb-6 relative overflow-hidden shadow-classic-md">
                    <div className=" absolute inset-0 text-black dark:text-white opacity-10 pointer-events-none"></div>
                    <p className="text-black dark:text-white text-sm font-bold relative z-10">
                      Para completar tu compra necesitarás enviar una captura de pantalla con el detalle de este pedido a nuestro WhatsApp.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleNextStep}
                      className="classic-btn w-full bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white rounded-lg py-3 font-bold flex items-center justify-center gap-2 uppercase shadow-classic-lg"
                    >
                      <span>Ya tomé mi captura</span>
                      <ArrowRight size={18} className="text-accent-primary" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="relative z-10 ">
                  <h2 className="text-xl font-bold text-accent-success dark:text-accent-primary mb-4 title-shadow uppercase">Completar en WhatsApp</h2>

                  <div className="border border-primary rounded-lg bg-white dark:bg-black border-4 border-black dark:border-white p-6 rounded-lg mb-6  relative overflow-hidden shadow-classic-lg">
                    <div className="flex items-center justify-center mb-4 relative z-10">
                      <div className="bg-white dark:bg-black border-4 border-black dark:border-white rounded-full p-4 border border-primary rounded-lg-light  shadow-classic-lg">
                        <MessageSquare size={48} className="text-accent-success" />
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <h3 className="text-black dark:text-white text-lg font-bold text-center title-shadow">Instrucciones finales:</h3>

                      <ol className="list-decimal list-inside space-y-3 pl-4 text-black dark:text-white font-semibold">
                        <li>Haz clic en el botón "Continuar en WhatsApp"</li>
                        <li>Envía la captura de pantalla que tomaste</li>
                        <li>Menciona el correo con el que estás registrado: <span className="border border-primary rounded-lg-light bg-white dark:bg-black border-2 border-black dark:border-white px-2 py-1 rounded text-accent-primary">{user.email}</span></li>
                        <li>Solicita los métodos de pago disponibles</li>
                        <li>Una vez verificado el pago, se añadirán los puntos a tu cuenta</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-4 border border-primary rounded-lg bg-white dark:bg-black border-4 border-black dark:border-white rounded-lg mb-6 relative overflow-hidden shadow-classic-md">
                    <div className=" absolute inset-0 text-black dark:text-white opacity-10"></div>
                    <p className="text-black dark:text-white text-sm font-bold relative z-10">
                      Por cada compra realizada acumularás puntos en tu cuenta que podrás utilizar en futuras compras.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={redirectToWhatsApp}
                      className="classic-btn w-full bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white rounded-lg py-3 font-bold flex items-center justify-center gap-2 uppercase shadow-classic-lg"
                    >
                      <MessageSquare size={18} className="text-accent-success" />
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