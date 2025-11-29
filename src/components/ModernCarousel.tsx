import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, limit, where, DocumentData } from "firebase/firestore";
import { db } from "../firebase";

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const collectionName = type === "streaming" ? "products" : "products-f";
        const productLimit = 12;

        const q = type === "streaming"
          ? query(collection(db, collectionName), limit(productLimit))
          : query(collection(db, collectionName), where("inStock", "==", true), limit(productLimit));

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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-stone-300 dark:border-zinc-700 border-t-stone-900 dark:border-t-stone-100"></div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <p className="text-stone-600 dark:text-stone-400">No hay productos disponibles</p>
      </div>
    );
  }

  // Grid responsivo: 1 en móvil, 2 en tablet, 3 en desktop, 4 en xl
  const visibleCount = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    xl: 4
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-zinc-800">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{title}</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">Descubre lo mejor de nuestra colección</p>
          </div>
        </div>
        <Link
          to={linkTo}
          className="text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 text-sm font-medium flex items-center gap-1 transition-colors duration-150"
        >
          Ver todo
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Carousel - Grid responsivo */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.slice(currentIndex, currentIndex + 4).map((product) => (
            <Link
              key={product.id}
              to={type === "streaming" ? `/product/${product.id}` : `/product-f/${product.id}`}
              className="block group"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-150">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-zinc-800">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/95 dark:bg-zinc-900/95 px-2 py-1 rounded-md text-xs font-medium text-stone-700 dark:text-stone-300">
                    {product.category}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-2 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {product.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(product.rating!)
                                ? 'text-stone-900 dark:text-stone-100 fill-current'
                                : 'text-stone-300 dark:text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-stone-600 dark:text-stone-400">
                        ({product.reviews || 0})
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-stone-500 dark:text-stone-500 line-through">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Buttons */}
        {products.length > 4 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 p-2 rounded-full shadow-md border border-stone-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-150"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 p-2 rounded-full shadow-md border border-stone-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-150"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {products.length > 4 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / 4) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * 4)}
              className={`transition-all duration-150 rounded-full ${
                Math.floor(currentIndex / 4) === index
                  ? 'w-8 h-2 bg-stone-900 dark:bg-stone-100'
                  : 'w-2 h-2 bg-stone-300 dark:bg-zinc-700 hover:bg-stone-400 dark:hover:bg-zinc-600'
              }`}
              aria-label={`Ir a la página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernCarousel;
