import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft, CheckCircle, Download, Image as ImageIcon, Loader, RefreshCw,
  Search, X, Grid, Layout, Settings, Plus, Minus, Eye, Zap, Palette, Layers, Tag, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

type Product = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl?: string;
  inStock?: boolean;
  source: 'digital' | 'physical';
};

type LayoutTemplate = {
  id: string;
  name: string;
  productsPerPage: number;
  layout: 'grid' | 'list' | 'showcase' | 'magazine' | 'minimal';
  cols: number;
  rows: number;
};

type Style = {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  cardBg: string;
  showDiscount: boolean;
  showDescription: boolean;
  showCategory: boolean;
  fontFamily: string;
  borderRadius: number;
  spacing: number;
};

type TextPosition = { x: number; y: number; width: number; height: number; };

type CustomElement = {
  id: string;
  type: 'text' | 'logo' | 'qr' | 'decoration';
  content: string;
  position: TextPosition;
  style: {
    fontSize: number;
    color: string;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
  };
};

const MAX_SELECTION = 20;

const layoutTemplates: LayoutTemplate[] = [
  { id: '1', name: '1 Producto (Showcase)', productsPerPage: 1, layout: 'showcase', cols: 1, rows: 1 },
  { id: '2', name: '2 Productos (Vertical)', productsPerPage: 2, layout: 'grid', cols: 1, rows: 2 },
  { id: '3', name: '2 Productos (Horizontal)', productsPerPage: 2, layout: 'grid', cols: 2, rows: 1 },
  { id: '4', name: '4 Productos (Grid)', productsPerPage: 4, layout: 'grid', cols: 2, rows: 2 },
  { id: '6', name: '6 Productos (Compacto)', productsPerPage: 6, layout: 'grid', cols: 3, rows: 2 },
  { id: '8', name: '8 Productos (Lista)', productsPerPage: 8, layout: 'list', cols: 1, rows: 8 },
  { id: '9', name: '9 Productos (Grid)', productsPerPage: 9, layout: 'grid', cols: 3, rows: 3 },
  { id: '12', name: '12 Productos (Catálogo)', productsPerPage: 12, layout: 'minimal', cols: 4, rows: 3 }
];

const stylePresets = {
  modern: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#f59e0b', text: '#ffffff', background: '#1e293b', cardBg: '#334155' },
  elegant: { primary: '#1f2937', secondary: '#374151', accent: '#d97706', text: '#f9fafb', background: '#111827', cardBg: '#1f2937' },
  vibrant: { primary: '#ef4444', secondary: '#f97316', accent: '#eab308', text: '#ffffff', background: '#7c2d12', cardBg: '#dc2626' },
  minimal: { primary: '#64748b', secondary: '#94a3b8', accent: '#06b6d4', text: '#1e293b', background: '#f8fafc', cardBg: '#ffffff' },
  luxury: { primary: '#7c3aed', secondary: '#a855f7', accent: '#fbbf24', text: '#ffffff', background: '#581c87', cardBg: '#6b21a8' },
  nature: { primary: '#16a34a', secondary: '#22c55e', accent: '#eab308', text: '#ffffff', background: '#14532d', cardBg: '#166534' }
};

const fontFamilies = [
  'Arial, sans-serif',
  'Georgia, serif',
  'Helvetica, sans-serif',
  'Times New Roman, serif',
  'Trebuchet MS, sans-serif',
  'Verdana, sans-serif'
];

const ExpressCatalog: React.FC = () => {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [customPrices, setCustomPrices] = useState<Map<string, { price: number; originalPrice?: number }>>(new Map());

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<LayoutTemplate>(layoutTemplates[3]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'products' | 'pricing' | 'layout' | 'design' | 'elements'>('products');

  const [style, setStyle] = useState<Style>({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    text: '#ffffff',
    background: '#1e293b',
    cardBg: '#334155',
    showDiscount: true,
    showDescription: true,
    showCategory: true,
    fontFamily: 'Arial, sans-serif',
    borderRadius: 8,
    spacing: 16
  });

  const [customElements, setCustomElements] = useState<CustomElement[]>([
    {
      id: 'title',
      type: 'text',
      content: 'CATÁLOGO DIGITAL',
      position: { x: 50, y: 30, width: 400, height: 60 },
      style: { fontSize: 32, color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }
    },
    {
      id: 'contact',
      type: 'text',
      content: 'WhatsApp: +57 300 000 0000',
      position: { x: 50, y: 750, width: 300, height: 40 },
      style: { fontSize: 18, color: '#ffffff', fontWeight: 'normal', textAlign: 'left' }
    }
  ]);

  const [collabInfo, setCollabInfo] = useState({ name: 'Tu Nombre', phone: '+57 300 000 0000', logo: '' });

  const [showSelectedMobile, setShowSelectedMobile] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // precios
  const getEffectiveProduct = useCallback((p: Product): Product => {
    const cp = customPrices.get(p.id);
    return cp ? { ...p, price: cp.price, originalPrice: cp.originalPrice || p.price } : p;
  }, [customPrices]);

  const setCustomPrice = useCallback((id: string, price: number, originalPrice?: number) => {
    setCustomPrices(prev => {
      const m = new Map(prev);
      m.set(id, { price, originalPrice });
      return m;
    });
  }, []);
  const resetPrice = useCallback((id: string) => {
    setCustomPrices(prev => { const m = new Map(prev); m.delete(id); return m; });
  }, []);
  const applyMarkupToSelected = useCallback((pct: number) => {
    selected.forEach(p => setCustomPrice(p.id, Math.round(p.price * (1 + pct / 100)), p.price));
  }, [selected, setCustomPrice]);

  // datos
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [s1, s2] = await Promise.all([
          getDocs(query(collection(db, 'products'), orderBy('name'))),
          getDocs(query(collection(db, 'products-f'), orderBy('name')))
        ]);
        if (!mounted) return;
        const mapDoc = (d: any, source: Product['source']): Product => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || data.title || data.productName || 'Producto',
            description: data.description || data.shortDescription || data.desc || data.longDescription || '',
            category: data.category || data.categoryName || (source === 'digital' ? 'Digital' : 'Físico'),
            price: Number(data.price ?? data.finalPrice ?? data.salePrice ?? 0),
            originalPrice: Number(data.originalPrice ?? data.regularPrice ?? data.price ?? 0),
            discount: Number(data.discount ?? data.discountPercent ?? 0),
            imageUrl: data.imageUrl || data.image || data.img || data.productImage || data.thumbnail || '',
            inStock: data.inStock !== false && data.available !== false,
            source
          };
        };
        setProducts([
          ...s1.docs.map(d => mapDoc(d, 'digital')),
          ...s2.docs.map(d => mapDoc(d, 'physical'))
        ]);
      } catch (e) {
        console.error('load products', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  useEffect(() => { setLoading(false); }, []);

  // filtros
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.description ?? '').toLowerCase().includes(s) ||
      (p.category ?? '').toLowerCase().includes(s)
    );
  }, [products, search]);

  const totalPages = Math.ceil(selected.length / currentTemplate.productsPerPage) || 0;

  const toggleSelect = useCallback((p: Product) => {
    setSelected(prev => {
      const exists = prev.some(x => x.id === p.id);
      if (exists) return prev.filter(x => x.id !== p.id);
      if (prev.length >= MAX_SELECTION) { alert(`Máximo ${MAX_SELECTION} productos`); return prev; }
      return [...prev, p];
    });
  }, []);

  const applyStylePreset = useCallback((n: keyof typeof stylePresets) => setStyle(prev => ({ ...prev, ...stylePresets[n] })), []);

  const loadImage = useCallback((src?: string): Promise<HTMLImageElement> => {
    if (!src) return Promise.resolve(new Image());
    if (imageCache.current.has(src)) return Promise.resolve(imageCache.current.get(src)!);
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { imageCache.current.set(src, img); resolve(img); };
      img.onerror = () => resolve(new Image());
      img.src = src;
    });
  }, []);

  // canvas
  const drawProductCard = async (ctx: CanvasRenderingContext2D, product: Product, x: number, y: number, width: number, height: number, scale = 1) => {
    const padding = 10 * scale;
    const r = Math.max(0, style.borderRadius) * scale;

    const roundRect = (xx: number, yy: number, w: number, h: number, rr: number) => {
      ctx.beginPath();
      ctx.moveTo(xx + rr, yy);
      ctx.lineTo(xx + w - rr, yy);
      ctx.quadraticCurveTo(xx + w, yy, xx + w, yy + rr);
      ctx.lineTo(xx + w, yy + h - rr);
      ctx.quadraticCurveTo(xx + w, yy + h, xx + w - rr, yy + h);
      ctx.lineTo(xx + rr, yy + h);
      ctx.quadraticCurveTo(xx, yy + h, xx, yy + h - rr);
      ctx.lineTo(xx, yy + rr);
      ctx.quadraticCurveTo(xx, yy, xx + rr, yy);
      ctx.closePath();
    };

    ctx.fillStyle = style.cardBg;
    roundRect(x, y, width, height, r);
    ctx.fill();
    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    const imageHeight = height * 0.6;
    const imageArea = { x: x + padding, y: y + padding, width: width - 2 * padding, height: imageHeight - padding };

    if (product.imageUrl && product.imageUrl.trim()) {
      const img = await loadImage(product.imageUrl);
      if (img.src && img.complete) {
        const imgRatio = img.width / img.height;
        const areaRatio = imageArea.width / imageArea.height;
        let dw: number, dh: number, dx: number, dy: number;
        if (imgRatio > areaRatio) { dw = imageArea.width; dh = imageArea.width / imgRatio; dx = imageArea.x; dy = imageArea.y + (imageArea.height - dh) / 2; }
        else { dh = imageArea.height; dw = imageArea.height * imgRatio; dx = imageArea.x + (imageArea.width - dw) / 2; dy = imageArea.y; }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, dx, dy, dw, dh);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(imageArea.x, imageArea.y, imageArea.width, imageArea.height);
        ctx.fillStyle = style.text;
        ctx.font = `${12 * scale}px ${style.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText('Imagen no disponible', imageArea.x + imageArea.width / 2, imageArea.y + imageArea.height / 2);
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(imageArea.x, imageArea.y, imageArea.width, imageArea.height);
      ctx.fillStyle = style.text;
      ctx.font = `${12 * scale}px ${style.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('Sin imagen', imageArea.x + imageArea.width / 2, imageArea.y + imageArea.height / 2);
    }

    // texto
    const textY = y + imageHeight + padding;
    const lineHeight = 16 * scale;
    let currentY = textY;

    if (style.showCategory && product.category) {
      ctx.fillStyle = style.accent;
      ctx.font = `bold ${10 * scale}px ${style.fontFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText(product.category.toUpperCase(), x + padding, currentY);
      currentY += lineHeight;
    }

    ctx.fillStyle = style.text;
    ctx.font = `bold ${14 * scale}px ${style.fontFamily}`;
    ctx.textAlign = 'left';

    const words = product.name.split(' ');
    let line = ''; let lc = 0;
    const maxWidth = width - 2 * padding, maxLines = 2;

    for (let i = 0; i < words.length && lc < maxLines; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x + padding, currentY);
        line = words[i] + ' ';
        currentY += lineHeight; lc++;
      } else line = test;
    }
    if (lc < maxLines && line.trim()) {
      if (line.trim().length > 30) line = line.trim().substring(0, 27) + '...';
      ctx.fillText(line.trim(), x + padding, currentY);
      currentY += lineHeight;
    }

    if (style.showDescription && product.description && currentY + lineHeight * 2 < y + height - 30 * scale) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `${10 * scale}px ${style.fontFamily}`;
      let desc = product.description;
      if (desc.length > 50) desc = desc.substring(0, 47) + '...';
      ctx.fillText(desc, x + padding, currentY);
    }

    const priceY = y + height - 25 * scale;
    ctx.fillStyle = style.accent;
    ctx.font = `bold ${16 * scale}px ${style.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${product.price.toLocaleString()}`, x + padding, priceY);

    if (style.showDiscount && product.originalPrice && product.originalPrice > product.price) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `${12 * scale}px ${style.fontFamily}`;
      const originalText = `${product.originalPrice.toLocaleString()}`;
      const w = ctx.measureText(originalText).width;
      const tx = x + width - padding - w;
      ctx.fillText(originalText, tx, priceY - 20 * scale);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath(); ctx.moveTo(tx, priceY - 25 * scale); ctx.lineTo(tx + w, priceY - 25 * scale); ctx.stroke();

      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x + width - 50 * scale, y + 5 * scale, 40 * scale, 20 * scale);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${10 * scale}px ${style.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(`-${discount}%`, x + width - 30 * scale, y + 17 * scale);
    }
  };

  const drawPage = useCallback(async (pageIndex: number) => {
    const canvas = document.createElement('canvas');
    const SCALE = 4, W = 595 * SCALE, H = 842 * SCALE;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, style.primary);
    grad.addColorStop(1, style.secondary);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const start = pageIndex * currentTemplate.productsPerPage;
    const pageProducts = selected.slice(start, start + currentTemplate.productsPerPage).map(getEffectiveProduct);

    const header = 100 * SCALE, footer = 80 * SCALE, padding = style.spacing * SCALE;
    const contentW = W - padding * 2, contentH = (H - header - footer) - padding * 2;
    const cols = currentTemplate.cols, rows = currentTemplate.rows;
    const cellW = (contentW - padding * (cols - 1)) / cols;
    const cellH = (contentH - padding * (rows - 1)) / rows;

    // elementos custom (texto)
    for (const el of customElements) {
      if (el.type !== 'text') continue;
      ctx.fillStyle = el.style.color;
      ctx.font = `${el.style.fontWeight} ${el.style.fontSize * SCALE}px ${style.fontFamily}`;
      ctx.textAlign = el.style.textAlign;
      const tx = el.style.textAlign === 'center'
        ? (el.position.x + el.position.width / 2) * SCALE
        : el.style.textAlign === 'right'
          ? (el.position.x + el.position.width) * SCALE
          : el.position.x * SCALE;
      ctx.fillText(el.content, tx, (el.position.y + el.style.fontSize) * SCALE);
    }

    for (let i = 0; i < pageProducts.length; i++) {
      const p = pageProducts[i];
      const row = Math.floor(i / cols), col = i % cols;
      const x = padding + col * (cellW + padding);
      const y = header + padding + row * (cellH + padding);
      await drawProductCard(ctx, p, x, y, cellW, cellH, SCALE);
    }

    return canvas;
  }, [style, currentTemplate, customElements, selected, getEffectiveProduct]);

  const updatePreview = useCallback(async () => {
    if (!previewCanvasRef.current) return;
    if (!selected.length) { previewCanvasRef.current.width = 0; previewCanvasRef.current.height = 0; return; }
    const big = await drawPage(currentPage);
    const ctx = previewCanvasRef.current.getContext('2d')!;
    const scale = 0.5, W = 595 * scale, H = 842 * scale;
    previewCanvasRef.current.width = W; previewCanvasRef.current.height = H;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(big, 0, 0, W, H);
  }, [selected, currentPage, drawPage]);
  useEffect(() => { const t = setTimeout(updatePreview, 220); return () => clearTimeout(t); }, [updatePreview]);

  const downloadPDF = useCallback(async () => {
    if (!selected.length) return alert('Selecciona productos');
    setIsGenerating(true); setGenerationProgress(0);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      for (let i = 0; i < totalPages; i++) {
        setGenerationProgress(Math.round(((i + 1) / Math.max(1, totalPages)) * 100));
        if (i > 0) pdf.addPage();
        const c = await drawPage(i);
        pdf.addImage(c.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 595, 842);
      }
      pdf.save(`catalogo_profesional_${Date.now()}.pdf`);
    } catch (e: any) {
      console.error('pdf', e); alert('Error generando PDF: ' + e.message);
    } finally { setIsGenerating(false); setGenerationProgress(0); }
  }, [selected, totalPages, drawPage]);

  const addCustomElement = useCallback(() => {
    setCustomElements(prev => [...prev, {
      id: `element_${Date.now()}`,
      type: 'text',
      content: 'Nuevo texto',
      position: { x: 50, y: 100, width: 200, height: 40 },
      style: { fontSize: 16, color: style.text, fontWeight: 'normal', textAlign: 'left' }
    }]);
  }, [style.text]);

  const updateCustomElement = useCallback((id: string, updates: Partial<CustomElement>) => {
    setCustomElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);
  const removeCustomElement = useCallback((id: string) => setCustomElements(prev => prev.filter(el => el.id !== id)), []);

  const renderSelectedList = (compact = false) => (
    <div className={compact ? 'space-y-2 max-h-72 overflow-y-auto pr-1' : 'space-y-2 max-h-96 overflow-y-auto pr-1'}>
      {selected.map((product, index) => {
        const eff = getEffectiveProduct(product);
        const custom = customPrices.has(product.id);
        return (
          <div key={product.id} className="flex items-center gap-3 p-2 bg-slate-700/50 border border-slate-600 rounded hover:border-slate-500 transition-colors">
            <div className="w-9 h-9 bg-slate-600 rounded overflow-hidden flex-shrink-0">
              {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-slate-300" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{product.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{product.category}</div>
              <div className="flex items-center gap-2">
                <div className={`text-sm font-bold ${custom ? 'text-yellow-400' : 'text-green-400'}`}>${eff.price.toLocaleString()}</div>
                {custom && <div className="text-[11px] text-slate-400 line-through">${product.price.toLocaleString()}</div>}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">#{index + 1}</div>
            <button onClick={() => toggleSelect(product)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"><X size={12} /></button>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Header XS compacto */}
          <div className="mb-3 sm:mb-6">
            <div className="flex items-center justify-between">
              <button onClick={() => nav('/collaborations')} className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300">
                <ArrowLeft size={18} /><span className="text-sm">Volver</span><Zap size={18} />
              </button>
              <div className="flex gap-2">
                <span className="text-[11px] sm:text-xs font-semibold bg-slate-700 px-2.5 py-1 rounded">{selected.length}/{MAX_SELECTION} productos</span>
                <span className="text-[11px] sm:text-xs font-semibold bg-slate-700 px-2.5 py-1 rounded">{totalPages} páginas</span>
              </div>
            </div>
            <h1 className="mt-2 text-[18px] sm:text-2xl font-extrabold leading-tight">Generador de Catálogos <span className="sm:inline block">Profesional</span></h1>
            <p className="text-slate-400 text-[13px] sm:text-sm">Diseña catálogos personalizados con múltiples layouts y estilos</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Controles / Tabs */}
            <div className="lg:col-span-1 order-1 space-y-3 md:sticky md:top-4 self-start">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-1">
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-1 min-w-max snap-x">
                    {[
                      { id: 'products', label: 'Productos', icon: Search },
                      { id: 'pricing', label: 'Precios', icon: Tag },
                      { id: 'layout', label: 'Layout', icon: Layout },
                      { id: 'design', label: 'Diseño', icon: Palette },
                      { id: 'elements', label: 'Elementos', icon: Layers }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`shrink-0 snap-start inline-flex items-center gap-2 px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                          activeTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <t.icon size={16} /><span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenido tabs */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                {activeTab === 'products' && (
                  <div className="p-3 sm:p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Buscar productos</label>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, categoría..."
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-2 pr-1">
                      {loading ? (
                        <div className="flex items-center gap-2 text-slate-400 py-8"><Loader className="animate-spin" size={16} />Cargando...</div>
                      ) : (
                        filtered.map(product => {
                          const eff = getEffectiveProduct(product);
                          const isSel = selected.some(p => p.id === product.id);
                          const custom = customPrices.has(product.id);
                          return (
                            <button
                              key={product.id}
                              onClick={() => toggleSelect(product)}
                              className={`w-full text-left p-2 rounded-lg border transition-all ${
                                isSel ? 'border-blue-400 bg-blue-400/10' : 'border-slate-600 hover:border-blue-400/50 bg-slate-700/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-600 rounded overflow-hidden flex items-center justify-center">
                                  {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-slate-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-semibold truncate">{product.name}</div>
                                  <div className="text-[11px] text-slate-400 truncate">{product.category}</div>
                                  <div className="flex items-center gap-2">
                                    <div className={`text-[13px] font-bold ${custom ? 'text-yellow-400' : 'text-green-400'}`}>
                                      ${eff.price.toLocaleString()}
                                    </div>
                                    {custom && <span className="text-[11px] text-slate-400 line-through">${product.price.toLocaleString()}</span>}
                                  </div>
                                </div>
                                {isSel && <CheckCircle size={16} className="text-blue-400" />}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {selected.length > 0 && (
                      <button onClick={() => setSelected([])} className="w-full px-3 py-2 bg-red-600/20 text-red-400 border border-red-600 rounded hover:bg-red-600/30">
                        Limpiar selección ({selected.length})
                      </button>
                    )}
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="p-3 sm:p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold">Gestión de Precios</h3>
                      <p className="text-[12px] text-slate-400">Personaliza tus precios</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Margen rápido</label>
                      <div className="grid grid-cols-4 gap-2 mb-1">
                        {[10, 20, 30, 50].map(pct => (
                          <button
                            key={pct}
                            onClick={() => applyMarkupToSelected(pct)}
                            disabled={!selected.length}
                            className={`px-2 py-2 rounded text-sm font-medium ${
                              selected.length ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                          >+{pct}%</button>
                        ))}
                      </div>
                      <div className="text-[12px] text-slate-400">Afecta a {selected.length} producto(s)</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Precios individuales</label>
                      <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-2 pr-1">
                        {selected.length === 0 ? (
                          <div className="text-center py-8 text-slate-400"><Tag size={26} className="mx-auto mb-2 opacity-50" />Selecciona productos</div>
                        ) : (
                          selected.map(p => {
                            const eff = getEffectiveProduct(p);
                            const custom = customPrices.has(p.id);
                            return (
                              <div key={p.id} className="bg-slate-700/30 border border-slate-600 rounded p-2">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-7 h-7 bg-slate-600 rounded overflow-hidden flex items-center justify-center">
                                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={12} className="text-slate-300" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-semibold truncate">{p.name}</div>
                                    <div className="text-[11px] text-slate-400">Base: ${p.price.toLocaleString()}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={eff.price}
                                    onChange={(e) => { const v = Number(e.target.value); if (v > 0) setCustomPrice(p.id, v, p.price); }}
                                    className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
                                    min={0} step={1000}
                                  />
                                  <button onClick={() => resetPrice(p.id)} disabled={!custom} className={`px-2 py-1 rounded text-xs ${custom ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}>
                                    Reset
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {customPrices.size > 0 && (
                      <div className="pt-2 border-t border-slate-600">
                        <button onClick={() => setCustomPrices(new Map())} className="w-full px-3 py-2 bg-red-600/20 text-red-400 border border-red-600 rounded hover:bg-red-600/30">
                          Resetear todos ({customPrices.size})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'layout' && (
                  <div className="p-3 sm:p-4 space-y-3">
                    <label className="block text-sm font-medium">Template</label>
                    <div className="space-y-2">
                      {layoutTemplates.map(t => (
                        <button key={t.id} onClick={() => setCurrentTemplate(t)} className={`w-full text-left p-3 rounded border transition-all ${currentTemplate.id === t.id ? 'border-orange-400 bg-orange-400/10' : 'border-slate-600 hover:border-orange-400/50'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{t.name}</div>
                              <div className="text-xs text-slate-400">{t.productsPerPage} productos • {t.cols}×{t.rows}</div>
                            </div>
                            <Grid size={16} className="text-slate-400" />
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Espaciado</label>
                        <input type="range" min="8" max="32" value={style.spacing} onChange={(e) => setStyle(p => ({ ...p, spacing: Number(e.target.value) }))} className="w-full" />
                        <div className="text-xs text-slate-400 mt-1">{style.spacing}px</div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Bordes</label>
                        <input type="range" min="0" max="20" value={style.borderRadius} onChange={(e) => setStyle(p => ({ ...p, borderRadius: Number(e.target.value) }))} className="w-full" />
                        <div className="text-xs text-slate-400 mt-1">{style.borderRadius}px</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="p-3 sm:p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Presets</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(stylePresets).map(([name, preset]) => (
                          <button key={name} onClick={() => applyStylePreset(name as keyof typeof stylePresets)} className="flex items-center gap-2 p-2 rounded border border-slate-600 hover:border-slate-400 text-xs">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }} /> {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div><label className="block text-xs text-slate-400 mb-1">Primario</label>
                        <input type="color" value={style.primary} onChange={(e) => setStyle(p => ({ ...p, primary: e.target.value }))} className="w-full h-8 rounded border border-slate-600" />
                      </div>
                      <div><label className="block text-xs text-slate-400 mb-1">Secundario</label>
                        <input type="color" value={style.secondary} onChange={(e) => setStyle(p => ({ ...p, secondary: e.target.value }))} className="w-full h-8 rounded border border-slate-600" />
                      </div>
                      <div><label className="block text-xs text-slate-400 mb-1">Acento</label>
                        <input type="color" value={style.accent} onChange={(e) => setStyle(p => ({ ...p, accent: e.target.value }))} className="w-full h-8 rounded border border-slate-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Fuente</label>
                        <select value={style.fontFamily} onChange={(e) => setStyle(p => ({ ...p, fontFamily: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm">
                          {fontFamilies.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Mostrar</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={style.showDiscount} onChange={(e) => setStyle(p => ({ ...p, showDiscount: e.target.checked }))} />Descuentos</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={style.showDescription} onChange={(e) => setStyle(p => ({ ...p, showDescription: e.target.checked }))} />Descripciones</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={style.showCategory} onChange={(e) => setStyle(p => ({ ...p, showCategory: e.target.checked }))} />Categorías</label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'elements' && (
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">Elementos personalizados</label>
                      <button onClick={addCustomElement} className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"><Plus size={12} className="inline mr-1" />Agregar</button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {customElements.map(el => (
                        <div key={el.id} className="bg-slate-700/50 border border-slate-600 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">{el.type.toUpperCase()}</span>
                            <button onClick={() => removeCustomElement(el.id)} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                          </div>
                          <div className="space-y-2">
                            <input value={el.content} onChange={(e) => updateCustomElement(el.id, { content: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs" />
                            <div className="grid grid-cols-2 gap-2">
                              <input type="number" value={el.style.fontSize} onChange={(e) => updateCustomElement(el.id, { style: { ...el.style, fontSize: Number(e.target.value) } })} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs" min={8} max={48} />
                              <input type="color" value={el.style.color} onChange={(e) => updateCustomElement(el.id, { style: { ...el.style, color: e.target.value } })} className="bg-slate-800 border border-slate-600 rounded px-1 py-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <select value={el.style.fontWeight} onChange={(e) => updateCustomElement(el.id, { style: { ...el.style, fontWeight: e.target.value } })} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs">
                                <option value="normal">Normal</option><option value="bold">Negrita</option>
                              </select>
                              <select value={el.style.textAlign} onChange={(e) => updateCustomElement(el.id, { style: { ...el.style, textAlign: e.target.value as any } })} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs">
                                <option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              <input type="number" value={el.position.x} onChange={(e) => updateCustomElement(el.id, { position: { ...el.position, x: Number(e.target.value) } })} className="bg-slate-800 border border-slate-600 rounded px-1 py-1 text-xs" placeholder="X" />
                              <input type="number" value={el.position.y} onChange={(e) => updateCustomElement(el.id, { position: { ...el.position, y: Number(e.target.value) } })} className="bg-slate-800 border border-slate-600 rounded px-1 py-1 text-xs" placeholder="Y" />
                              <input type="number" value={el.position.width} onChange={(e) => updateCustomElement(el.id, { position: { ...el.position, width: Number(e.target.value) } })} className="bg-slate-800 border border-slate-600 rounded px-1 py-1 text-xs" placeholder="W" />
                              <input type="number" value={el.position.height} onChange={(e) => updateCustomElement(el.id, { position: { ...el.position, height: Number(e.target.value) } })} className="bg-slate-800 border border-slate-600 rounded px-1 py-1 text-xs" placeholder="H" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Colaborador</label>
                      <div className="space-y-2">
                        <input value={collabInfo.name} onChange={(e) => setCollabInfo(p => ({ ...p, name: e.target.value }))} placeholder="Tu nombre" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm" />
                        <input value={collabInfo.phone} onChange={(e) => setCollabInfo(p => ({ ...p, phone: e.target.value }))} placeholder="Tu teléfono" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Acordeón selección en móvil */}
              <div className="lg:hidden">
                <button onClick={() => setShowSelectedMobile(s => !s)} className="w-full mt-2 inline-flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold">Seleccionados ({selected.length}/{MAX_SELECTION})</span>
                  <ChevronDown className={`transition-transform ${showSelectedMobile ? 'rotate-180' : ''}`} size={18} />
                </button>
                {showSelectedMobile && (
                  <div className="mt-2 bg-slate-800 border border-slate-700 rounded-lg p-3">
                    {selected.length ? renderSelectedList(true) : <div className="text-center py-6 text-slate-400 text-sm">No hay productos seleccionados</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2 order-2">
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-3 sm:px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye size={18} />
                      <div>
                        <h3 className="font-bold text-sm sm:text-base">Vista Previa</h3>
                        <p className="text-xs opacity-90">Página {selected.length ? currentPage + 1 : 0} de {totalPages}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="p-2 bg-white/20 rounded disabled:opacity-50 hover:bg-white/30"><Minus size={14} /></button>
                      <button onClick={() => setCurrentPage(Math.min(Math.max(totalPages - 1, 0), currentPage + 1))} disabled={currentPage >= totalPages - 1 || totalPages === 0} className="p-2 bg-white/20 rounded disabled:opacity-50 hover:bg-white/30"><Plus size={14} /></button>
                      <button onClick={updatePreview} className="px-3 py-2 bg-white/20 rounded hover:bg-white/30 text-xs sm:text-sm"><RefreshCw size={13} className="inline mr-1" />Actualizar</button>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex justify-center">
                    <canvas ref={previewCanvasRef} className="border-2 border-slate-600 rounded-lg shadow-2xl w-full h-auto max-w-[520px]" />
                  </div>
                  {!selected.length && (
                    <div className="text-center py-10 text-slate-400">
                      <Search size={40} className="mx-auto mb-3 opacity-50" />
                      <p>Selecciona productos para ver la vista previa</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selección desktop */}
            <div className="lg:col-span-1 order-3 hidden lg:block">
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Productos Seleccionados</h3>
                      <p className="text-sm opacity-90">{selected.length} de {MAX_SELECTION}</p>
                    </div>
                    <Settings size={20} />
                  </div>
                </div>
                <div className="p-4">
                  {selected.length ? renderSelectedList(false) : (
                    <div className="text-center py-8 text-slate-400"><Tag size={32} className="mx-auto mb-3 opacity-50" />No hay productos seleccionados</div>
                  )}
                  {selected.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <button onClick={downloadPDF} disabled={isGenerating} className={`w-full px-4 py-3 rounded-lg font-bold transition-all ${isGenerating ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg'}`}>
                        {isGenerating ? <div className="flex items-center justify-center gap-2"><Loader className="animate-spin" size={16} />Generando {Math.round(generationProgress)}%</div> : <div className="flex items-center justify-center gap-2"><Download size={16} />Descargar PDF ({totalPages} páginas)</div>}
                      </button>
                      <div className="mt-2 text-xs text-slate-400 text-center">Template: {currentTemplate.name} • {currentTemplate.productsPerPage} productos/página</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-sm">Estadísticas del catálogo</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Total productos:</span><span className="font-medium">{selected.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Páginas generadas:</span><span className="font-medium">{totalPages}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Valor total catálogo:</span><span className="font-medium text-green-400">${selected.reduce((s, p) => s + getEffectiveProduct(p).price, 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Tu ganancia total:</span><span className="font-medium text-yellow-400">${selected.reduce((s, p) => { const e = getEffectiveProduct(p); return s + (e.price - p.price); }, 0).toLocaleString()}</span></div>
                  {customPrices.size > 0 && <div className="flex justify-between"><span className="text-slate-400">Con precio custom:</span><span className="font-medium text-blue-400">{customPrices.size}</span></div>}
                </div>
              </div>
            </div>
          </div>

          {/* FAB móvil */}
          {selected.length > 0 && (
            <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button onClick={downloadPDF} disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-xl font-bold shadow-2xl ${isGenerating ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'}`}>
                {isGenerating ? <div className="flex items-center justify-center gap-2"><Loader className="animate-spin" size={16} />Generando {Math.round(generationProgress)}%</div> : <div className="flex items-center justify-center gap-2"><Download size={16} />Descargar PDF ({totalPages})</div>}
              </button>
            </div>
          )}

          {/* Overlay progreso */}
          {isGenerating && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-slate-800 border border-slate-600 rounded-xl p-8 text-center max-w-md w-full mx-4">
                <div className="w-16 h-16 mx-auto mb-6"><Loader className="w-full h-full animate-spin text-blue-500" /></div>
                <h3 className="text-xl font-bold mb-2">Generando catálogo</h3>
                <p className="text-slate-400 mb-4">Creando página {totalPages ? Math.ceil((generationProgress / 100) * totalPages) : 0} de {totalPages}</p>
                <div className="w-full bg-slate-700 rounded-full h-3 mb-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out" style={{ width: `${generationProgress}%` }} />
                </div>
                <div className="text-sm font-bold text-blue-400">{Math.round(generationProgress)}% completado</div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 sm:mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4">Características profesionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"><Layout className="text-blue-400" size={20} /><div><div className="font-medium">Múltiples layouts</div><div className="text-slate-400">8 templates</div></div></div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"><Palette className="text-purple-400" size={20} /><div><div className="font-medium">Personalización</div><div className="text-slate-400">Colores, fuentes, espaciado</div></div></div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"><Layers className="text-green-400" size={20} /><div><div className="font-medium">Elementos</div><div className="text-slate-400">Textos, logos, decoraciones</div></div></div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"><Tag className="text-yellow-400" size={20} /><div><div className="font-medium">Precios custom</div><div className="text-slate-400">Ideal para reventa</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpressCatalog;
