import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, limit, where, DocumentData } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  category: string;
  rating?: number;
  reviews?: number;
  description?: string;
}

interface ModernCarouselProps {
  type: "streaming" | "physical";
  title: string;
  icon: React.ReactNode;
  linkTo: string;
}

const ModernCarousel: React.FC<ModernCarouselProps> = ({ type, title, icon, linkTo }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const collectionName = type === "streaming" ? "products" : "products-f";
        const q = type === "streaming"
          ? query(collection(db, collectionName), limit(12))
          : query(collection(db, collectionName), where("inStock", "==", true), limit(12));

        const snapshot = await getDocs(q);
        const items: Product[] = snapshot.docs.map((doc) => {
          const d = doc.data() as DocumentData;
          return {
            id: doc.id,
            name: d.name || "Producto",
            price: d.price || 0,
            originalPrice: d.originalPrice || d.price,
            discount: d.discount || 0,
            imageUrl: d.imageUrl || "https://via.placeholder.com/400x300",
            category: d.category || "General",
            rating: d.rating || 4.5,
            reviews: d.reviews || 0,
            description: d.description || "",
          };
        });

        setProducts(items);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [type]);

  // Auto-scroll (pausar cuando el usuario está hovering)
  useEffect(() => {
    if (products.length === 0 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length, isHovered]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      ...product,
      quantity: 1,
      inStock: true,
    } as any);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-accent-primary border-t-transparent"></div>
          <p className="text-sm text-secondary">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <p className="text-secondary">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/10 to-accent-success/10 backdrop-blur-sm">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-primary">{title}</h2>
            <p className="text-sm text-secondary">Descubre lo mejor de nuestra colección</p>
          </div>
        </div>
        <Link
          to={linkTo}
          className="text-accent-primary hover:text-accent-primary/80 text-sm font-semibold flex items-center gap-1 transition-colors duration-200"
        >
          Ver todo
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Carousel Container with Peek Effect */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${currentIndex * 16}px))`,
          }}
        >
          {products.map((product, index) => {
            const isActive = index === currentIndex;
            const isPrev = index === (currentIndex - 1 + products.length) % products.length;
            const isNext = index === (currentIndex + 1) % products.length;
            const isVisible = isActive || isPrev || isNext;

            return (
              <div
                key={product.id}
                className={`flex-shrink-0 transition-all duration-500 px-2 ${
                  isActive ? 'w-full sm:w-3/4 lg:w-2/3' : 'w-0 sm:w-1/4 lg:w-1/6 opacity-0 sm:opacity-50'
                }`}
                style={{
                  transitionProperty: 'width, opacity, transform',
                }}
              >
                <Link
                  to={type === "streaming" ? `/product/${product.id}` : `/product-f/${product.id}`}
                  className={`block h-full group ${!isVisible ? 'pointer-events-none' : ''}`}
                >
                  <div className={`
                    relative h-full rounded-2xl overflow-hidden
                    bg-white dark:bg-gray-900
                    transition-all duration-500
                    ${isActive
                      ? 'shadow-2xl scale-100'
                      : 'shadow-lg scale-95 hover:scale-98'
                    }
                  `}>
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Discount Badge */}
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-accent-error text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          -{product.discount}%
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary shadow-lg">
                        {product.category}
                      </div>

                      {/* Quick Add Button - Only on active card */}
                      {isActive && (
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="absolute bottom-3 right-3 bg-accent-primary hover:bg-accent-primary/90 text-white p-3 rounded-full shadow-lg transform translate-y-12 group-hover:translate-y-0 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Content Section - Only visible on active card */}
                    {isActive && (
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2 min-h-[3.5rem]">
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="text-sm text-secondary mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating!)
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-secondary">
                              ({product.reviews || 0})
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-accent-primary">
                              ${product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-secondary line-through">
                                ${product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        {products.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 text-primary p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100 hover:scale-110 z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 text-primary p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100 hover:scale-110 z-10"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {products.slice(0, 8).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-accent-primary'
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-accent-primary/50'
              }`}
              aria-label={`Ir al producto ${index + 1}`}
            />
          ))}
          {products.length > 8 && (
            <span className="text-xs text-secondary self-center ml-1">
              +{products.length - 8}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernCarousel;
