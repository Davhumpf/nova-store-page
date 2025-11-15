// src/components/PhysicalProductsCarousel.tsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { collection, getDocs, query, limit, where } from "firebase/firestore";
import { db } from "../firebase";

interface PhysicalProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
  shippingInfo: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const PhysicalProductsCarousel: React.FC = () => {
  const [products, setProducts] = useState<PhysicalProduct[]>([]);
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
        const q = query(
          collection(db, "products-f"),
          where("inStock", "==", true),
          limit(8)
        );
        const snapshot = await getDocs(q);
        const items: PhysicalProduct[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || "Producto",
            description: d.description || "",
            category: d.category || "General",
            price: d.price || 0,
            originalPrice: d.originalPrice || d.price,
            discount: d.discount || 0,
            imageUrl: d.imageUrl || "https://via.placeholder.com/300",
            inStock: d.inStock || false,
            stockQuantity: d.stockQuantity || 0,
            shippingInfo: d.shippingInfo || "Envío disponible",
          };
        });
        setProducts(shuffleArray(items));
      } catch (error) {
        console.error("Error cargando productos físicos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % products.length),
      5000
    );
    return () => clearInterval(interval);
  }, [products]);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % products.length);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8 halftone-pattern">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-8 halftone-pattern">
        <p className="elegant-text-secondary text-sm">No hay productos físicos</p>
      </div>
    );
  }

  const visibleProducts = [];
  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % products.length;
    visibleProducts.push(products[index]);
  }

  return (
    <div className="relative w-full comic-vignette halftone-pattern bg-white dark:bg-black p-6">
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
            className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-xl elegant-card halftone-pattern overflow-hidden group transition-all duration-300"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 min-h-[100px] flex flex-col justify-between bg-white dark:bg-black">
              <h3 className="elegant-text-primary font-bold text-sm truncate mb-1">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <p className="elegant-text-primary font-bold text-lg">
                  ${product.price.toLocaleString()}
                </p>
                <span className="text-xs elegant-text-primary bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 px-2 py-1 rounded-lg font-bold uppercase shadow-[0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_4px_rgba(255,255,255,0.06)]">
                  {product.category}
                </span>
              </div>
              {product.shippingInfo && (
                <div className="flex items-center justify-end mt-2 text-xs elegant-text-secondary font-semibold">
                  <Truck size={12} className="mr-1 inking-icon" />
                  <span>{product.shippingInfo}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length > visibleCount && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-black border-2 border-black dark:border-white elegant-text-primary p-2 rounded-full hover:scale-110 transition-all duration-300 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.12)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_6px_16px_rgba(255,255,255,0.16)]"
          >
            <ChevronLeft size={16} className="inking-icon" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-black border-2 border-black dark:border-white elegant-text-primary p-2 rounded-full hover:scale-110 transition-all duration-300 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.12)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_6px_16px_rgba(255,255,255,0.16)]"
          >
            <ChevronRight size={16} className="inking-icon" />
          </button>
        </>
      )}
    </div>
  );
};

export default PhysicalProductsCarousel;