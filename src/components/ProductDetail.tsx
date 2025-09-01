import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Star, ShoppingCart, ArrowLeft, Clock, Monitor, Shield, Zap, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-300">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-6 p-8">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-200 mb-4">Producto no encontrado</h2>
          <p className="text-slate-400 mb-6">Lo sentimos, este producto no existe o ha sido eliminado.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft size={20} />
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-all duration-300 mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm">Volver a Productos</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Product Image - Left Side */}
          <div className="order-1">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="aspect-square relative overflow-hidden">{!imageLoaded && (
                    <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-slate-600 border-t-yellow-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  
                  {/* Discount badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-2 py-1 rounded-lg shadow-lg text-sm">
                      -{product.discount}%
                    </div>
                  )}
                  
                  {/* Available status */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-slate-800/90 backdrop-blur-sm text-green-400 px-2 py-1 rounded-lg flex items-center text-sm font-medium">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                      Disponible
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info - Right Side */}
          <div className="order-2 space-y-5">
            {/* Title & Rating Section */}
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-500 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(product.rating ?? 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-slate-600'
                      } transition-colors`}
                    />
                  ))}
                </div>
                <span className="text-slate-300 font-medium text-sm">
                  {product.rating?.toFixed(1)} • {product.reviewCount ?? 0} reseñas
                </span>
              </div>
            </div>

            {/* Price & Features en una sola fila */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Precio */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-yellow-400">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-slate-500 line-through">
                        ${product.originalPrice.toLocaleString('es-CO')}
                      </span>
                    )}
                  </div>
                  {product.originalPrice > product.price && (
                    <div className="bg-green-400/10 text-green-400 font-bold text-xs px-2 py-1 rounded-md inline-block">
                      ¡Ahorras ${(product.originalPrice - product.price).toLocaleString('es-CO')}!
                    </div>
                  )}
                </div>

                {/* Duración */}
                <div className="text-center border-l border-slate-700/50 pl-4">
                  <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-slate-200 font-semibold text-xs">Duración</div>
                  <div className="text-slate-300 text-xs">{product.duration}</div>
                </div>
                
                {/* Dispositivos */}
                <div className="text-center border-l border-slate-700/50 pl-4">
                  <Monitor className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-slate-200 font-semibold text-xs">Dispositivos</div>
                  <div className="text-slate-300 text-xs">{product.devices}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4">
              <p className="text-slate-300 leading-relaxed text-sm">
                {product.longDescription}
              </p>
            </div>

            {/* Benefits - Simplificado */}
            <div className="flex items-center justify-center gap-6 bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm rounded-lg border border-green-500/30 p-3">
              <div className="flex items-center gap-1 text-slate-300 text-xs">
                <Check className="w-3 h-3 text-green-400" />
                <span>Activación inmediata</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300 text-xs">
                <Shield className="w-3 h-3 text-green-400" />
                <span>Garantía total</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 py-3 px-6 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-xl hover:shadow-yellow-400/25"
              >
                <ShoppingCart size={18} />
                Añadir al Carrito
              </button>
              
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Zap className="w-4 h-4 text-green-400" />
                <span>Activación automática tras la compra</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;