// src/components/SpotlightCarousel.tsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../firebase";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SpotlightCarousel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(2);
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), limit(10));
        const snapshot = await getDocs(q);
        const items: Product[] = snapshot.docs.map((doc) => {
          const d = doc.data() as any;
          return {
            id: doc.id,
            name: d.name || "Producto",
            price: d.price || 0,
            imageUrl: d.imageUrl || "https://via.placeholder.com/300",
            category: d.category || "general",
          };
        });
        setProducts(shuffleArray(items));
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % products.length);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8 halftone-pattern">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pop-green"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-8 halftone-pattern">
        <p className="text-[#595959] dark:text-gray-400 text-sm comic-text-outline">No hay productos disponibles</p>
      </div>
    );
  }

  const visibleProducts = [];
  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % products.length;
    visibleProducts.push(products[index]);
  }

  return (
    <div className="relative w-full comic-border halftone-pattern bg-white dark:bg-black border-4 border-black dark:border-white rounded-xl overflow-hidden p-4 speed-lines shadow-[8px_8px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.5)]">
      <div
        className={`grid gap-4 ${
          visibleCount === 1
            ? "grid-cols-1"
            : visibleCount === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {visibleProducts.map((product) => (
          <div
            key={`${product.id}-${currentIndex}`}
            className="bg-white dark:bg-black border-2 border-black dark:border-white comic-border-light comic-hover animate-comic-pop halftone-pattern overflow-hidden group shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 min-h-[100px] flex flex-col justify-between bg-white dark:bg-black">
              <h3 className="text-black dark:text-white font-bold text-sm truncate mb-1 comic-text-shadow">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-pop-green font-bold text-lg comic-text-shadow">
                  ${product.price.toLocaleString()}
                </p>
                <span className="text-xs text-black dark:text-white bg-white dark:bg-black border-2 border-black dark:border-white px-2 py-1 rounded-full font-bold uppercase">
                  <span className="text-pop-yellow">{product.category}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length > visibleCount && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 comic-button bg-white dark:bg-black border-4 border-black dark:border-white text-pop-red p-2 rounded-full hover:scale-110 transition z-10 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 comic-button bg-white dark:bg-black border-4 border-black dark:border-white text-pop-red p-2 rounded-full hover:scale-110 transition z-10 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
};

export default SpotlightCarousel;