// src/components/HomeWithSmartHeader.tsx
import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import HomeSection from "./HomeSection";

const HomeWithSmartHeader: React.FC = () => {
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // visible => false; fuera de vista => true
        setShowHeaderTitle(!entry.isIntersecting);
      },
      {
        threshold: 0.1,            // cuando ~10% visible
        root: null,
        rootMargin: "-8% 0px 0px 0px", // dispara un poco antes
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-purple-50/30 dark:bg-[#0F0A1F]">
      <Header showHeaderTitle={showHeaderTitle} />
      <HomeSection titleRef={titleRef} />
    </div>
  );
};

export default HomeWithSmartHeader;