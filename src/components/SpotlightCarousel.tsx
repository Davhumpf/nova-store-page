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
      <div className="w-full flex justify-center items-center py-8 ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-8 ">
        <p className="elegant-text-secondary text-sm">No hay productos disponibles</p>
      </div>
    );
  }

  const visibleProducts = [];
  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % products.length;
    visibleProducts.push(products[index]);
  }

  return (
    <div className="relative w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-4">
      <div
        className={`grid gap-3 ${
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
            className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg overflow-hidden group transition-all duration-200"
          >
            <div className="relative aspect-video overflow-hidden bg-black/5 dark:bg-white/5">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
              />
            </div>
            <div className="p-3 min-h-[100px] flex flex-col justify-between">
              <h3 className="elegant-text-primary font-semibold text-sm truncate mb-1">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <p className="elegant-text-primary font-bold text-base">
                  ${product.price.toLocaleString()}
                </p>
                <span className="text-xs elegant-text-secondary px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 font-medium uppercase">
                  {product.category}
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
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-black border border-black/10 dark:border-white/10 elegant-text-primary p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 z-10 shadow-md"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-black border border-black/10 dark:border-white/10 elegant-text-primary p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 z-10 shadow-md"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
};

export default SpotlightCarousel;