import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Package, 
  Star, 
  ArrowLeft,
  Copy,
  MessageCircle,
  Megaphone,
  Download,
  CheckCircle,
  RefreshCw,
  FileText,
  Camera,
  Zap,
  Loader,
  Plus,
  Minus,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  planType: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  duration: string;
  devices: string;
  inStock: boolean;
}

interface BannerStyle {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  gradientType: 'linear' | 'radial' | 'diagonal' | 'horizontal' | 'vertical';
}

type AdMode = 'text' | 'banner' | 'image';
type AdTemplate = 'modern' | 'story' | 'professional' | 'casual';

// Componente de producto simplificado para móvil
const MobileProductCard: React.FC<{
  product: Product;
  isSelected: boolean;
  onToggle: (product: Product) => void;
}> = React.memo(({ product, isSelected, onToggle }) => (
  <div
    className={`p-4 rounded-xl border-2 transition-all duration-300 group cursor-pointer active:scale-95 ${
      isSelected
        ? 'bg-[#FFD600]/20 border-[#FFD600] shadow-lg shadow-[#FFD600]/20'
        : 'bg-[#1a1a1a] border-gray-700/50 hover:border-[#FFD600]/50 active:border-[#FFD600]'
    } ${!product.inStock ? 'opacity-60' : ''}`}
    onClick={() => onToggle(product)}
  >
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-600 group-hover:border-[#FFD600] transition-colors"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
            <span className="text-red-400 text-xs font-bold">Sin Stock</span>
          </div>
        )}
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-[#FFD600] text-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle size={18} />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-base leading-tight">{product.name}</h3>
          <div className="flex items-center gap-1 text-[#FFD600] text-sm ml-2 flex-shrink-0">
            <Star size={14} className="fill-current" />
            <span>{product.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFD600]/10 text-[#FFD600] px-3 py-1 rounded-full text-xs font-medium border border-[#FFD600]/20">
              {product.category}
            </span>
            {product.discount > 0 && (
              <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded-full text-xs font-medium border border-red-500/20">
                -{product.discount}%
              </span>
            )}
          </div>
          
          <div className="text-right">
            {product.discount > 0 && (
              <span className="text-gray-400 line-through text-sm block">${product.originalPrice.toLocaleString()}</span>
            )}
            <p className="text-[#FFD600] font-bold text-lg">${product.price.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Componente de resumen flotante para móvil
const MobileCartSummary: React.FC<{
  selectedProducts: Product[];
  customPrices: {[key: string]: number};
  total: number;
  profit: number;
  comboName: string;
  onOpenGenerator: () => void;
}> = ({ selectedProducts, customPrices, total, profit, comboName, onOpenGenerator }) => {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] p-4 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between text-black">
          <div className="flex-1">
            <p className="font-bold text-lg">
              {selectedProducts.length === 1 ? selectedProducts[0].name : comboName}
            </p>
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl">${total.toLocaleString()}</span>
              {profit > 0 && (
                <span className="text-green-700 text-sm font-medium">
                  Ganancia ${profit.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={onOpenGenerator}
            className="bg-black/20 hover:bg-black/30 active:bg-black/40 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
          >
            <Megaphone size={20} />
            Crear
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de generador para móvil
const MobileGeneratorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  customPrices: {[key: string]: number};
  onUpdatePrice: (productId: string, price: number) => void;
  comboCalculations: { total: number; profit: number; comboName: string };
  collaboratorName: string;
  setCollaboratorName: (name: string) => void;
  collaboratorPhone: string;
  setCollaboratorPhone: (phone: string) => void;
  customMessage: string;
  setCustomMessage: (message: string) => void;
  adMode: AdMode;
  setAdMode: (mode: AdMode) => void;
  selectedTemplate: AdTemplate;
  setSelectedTemplate: (template: AdTemplate) => void;
  bannerStyle: BannerStyle;
  setBannerStyle: (style: BannerStyle) => void;
  onGenerateText: () => void;
  onGenerateBanner: () => void;
  generatedAd: string;
  isGenerating: boolean;
  copySuccess: boolean;
  onCopyToClipboard: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDownloadBanner: () => void;
}> = ({
  isOpen,
  onClose,
  selectedProducts,
  customPrices,
  onUpdatePrice,
  comboCalculations,
  collaboratorName,
  setCollaboratorName,
  collaboratorPhone,
  setCollaboratorPhone,
  customMessage,
  setCustomMessage,
  adMode,
  setAdMode,
  selectedTemplate,
  setSelectedTemplate,
  bannerStyle,
  setBannerStyle,
  onGenerateText,
  onGenerateBanner,
  generatedAd,
  isGenerating,
  copySuccess,
  onCopyToClipboard,
  canvasRef,
  onDownloadBanner
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPriceEditor, setShowPriceEditor] = useState(false);

  if (!isOpen) return null;

  const steps = ['Configuración', 'Personalización', 'Generación'];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] p-4 flex items-center justify-between">
          <h2 className="text-black font-bold text-xl">Crear Publicidad</h2>
          <button
            onClick={onClose}
            className="bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors"
          >
            <X size={24} className="text-black" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="bg-[#1a1a1a] px-4 py-3">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index <= currentStep 
                      ? 'bg-[#FFD600] text-black' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`mt-1 text-xs font-medium ${
                    index <= currentStep ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-0.5 mt-2 ${
                    index < currentStep ? 'bg-[#FFD600]' : 'bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] p-4">
          {currentStep === 0 && (
            <div className="space-y-6">
              {/* Resumen de productos */}
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFD600] font-bold text-lg">
                    {selectedProducts.length === 1 ? 'Producto seleccionado' : comboCalculations.comboName}
                  </h3>
                  <button
                    onClick={() => setShowPriceEditor(!showPriceEditor)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Settings size={20} />
                  </button>
                </div>
                
                {selectedProducts.map((product) => {
                  const customPrice = customPrices[product.id] || product.price;
                  return (
                    <div key={product.id} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-400 text-sm">Base: ${product.price.toLocaleString()}</p>
                        </div>
                        
                        {showPriceEditor ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={customPrice}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Permitir campo vacío o solo números
                                if (value === '' || /^\d+$/.test(value)) {
                                  onUpdatePrice(product.id, value === '' ? 0 : parseInt(value));
                                }
                              }}
                              onBlur={(e) => {
                                // Si está vacío al perder el foco, restaurar al precio base
                                if (e.target.value === '') {
                                  onUpdatePrice(product.id, product.price);
                                }
                              }}
                              className="w-28 bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50"
                              placeholder={product.price.toString()}
                            />
                          </div>
                        ) : (
                          <span className="text-[#FFD600] font-bold text-lg">
                            ${customPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                <div className="border-t border-gray-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">Total:</span>
                    <span className="text-[#FFD600] font-bold text-xl">${comboCalculations.total.toLocaleString()}</span>
                  </div>
                  
                  {comboCalculations.profit !== 0 && (
                    <div className="flex justify-between items-center mt-1">
                      <span className={comboCalculations.profit > 0 ? "text-green-400" : "text-red-400"}>
                        {comboCalculations.profit > 0 ? "Ganancia:" : "Pérdida:"}
                      </span>
                      <span className={`font-bold ${comboCalculations.profit > 0 ? "text-green-400" : "text-red-400"}`}>
                        ${Math.abs(comboCalculations.profit).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos del colaborador */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-lg">Tus datos</h4>
                <input
                  type="text"
                  value={collaboratorName}
                  onChange={(e) => setCollaboratorName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded-xl py-4 px-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50"
                />
                <input
                  type="text"
                  value={collaboratorPhone}
                  onChange={(e) => setCollaboratorPhone(e.target.value)}
                  placeholder="Tu teléfono"
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded-xl py-4 px-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50"
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Tipo de publicidad */}
              <div>
                <h4 className="text-white font-bold text-lg mb-4">Tipo de publicidad</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { mode: 'text' as AdMode, icon: FileText, label: 'Texto' },
                    { mode: 'banner' as AdMode, icon: Camera, label: 'Banner' }
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setAdMode(mode)}
                      className={`p-4 rounded-xl border-2 transition-all font-medium flex items-center gap-3 active:scale-95 ${
                        adMode === mode
                          ? 'bg-[#FFD600]/20 border-[#FFD600] text-[#FFD600]'
                          : 'bg-[#1a1a1a] border-gray-600 text-gray-300 hover:border-[#FFD600]/50'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-lg">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuración específica */}
              {adMode === 'text' && (
                <div>
                  <h4 className="text-white font-bold text-lg mb-4">Estilo de texto</h4>
                  <div className="space-y-3">
                    {(['modern', 'story', 'professional', 'casual'] as AdTemplate[]).map(template => (
                      <button
                        key={template}
                        onClick={() => setSelectedTemplate(template)}
                        className={`w-full p-4 rounded-xl border-2 transition-all font-medium text-left active:scale-95 ${
                          selectedTemplate === template
                            ? 'bg-[#FFD600]/20 border-[#FFD600] text-[#FFD600]'
                            : 'bg-[#1a1a1a] border-gray-600 text-gray-300 hover:border-[#FFD600]/50'
                        }`}
                      >
                        <div className="text-lg font-bold mb-1">
                          {template.charAt(0).toUpperCase() + template.slice(1)}
                        </div>
                        <div className="text-sm opacity-75">
                          {template === 'modern' && 'Moderno con emojis y formato atractivo'}
                          {template === 'story' && 'Narrativo con urgencia y emoción'}
                          {template === 'professional' && 'Formal y técnico para empresas'}
                          {template === 'casual' && 'Relajado y amigable'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {adMode === 'banner' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-lg">Colores del banner</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-medium">Color primario</label>
                      <input
                        type="color"
                        value={bannerStyle.primaryColor}
                        onChange={(e) => setBannerStyle({...bannerStyle, primaryColor: e.target.value})}
                        className="w-full h-12 rounded-xl border border-gray-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-medium">Color secundario</label>
                      <input
                        type="color"
                        value={bannerStyle.secondaryColor}
                        onChange={(e) => setBannerStyle({...bannerStyle, secondaryColor: e.target.value})}
                        className="w-full h-12 rounded-xl border border-gray-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje personalizado */}
              <div>
                <h4 className="text-white font-bold text-lg mb-3">Mensaje personalizado</h4>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Ej: ¡Perfecta para estudiantes y profesionales!"
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded-xl py-4 px-4 text-white h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Botón generar */}
              <button
                onClick={adMode === 'text' ? onGenerateText : onGenerateBanner}
                disabled={!collaboratorName || isGenerating}
                className="w-full bg-gradient-to-r from-[#FFD600] to-[#FFC400] hover:from-[#FFC400] hover:to-[#FFD600] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg active:scale-95"
              >
                {isGenerating ? (
                  <Loader size={24} className="animate-spin" />
                ) : (
                  <Zap size={24} />
                )}
                {isGenerating ? 'Generando...' : `Generar ${adMode === 'text' ? 'Texto' : 'Banner'}`}
              </button>

              {/* Resultado de texto */}
              {adMode === 'text' && generatedAd && (
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400" size={24} />
                      <h4 className="text-green-400 font-bold text-lg">Publicidad Lista</h4>
                    </div>
                    
                    <button
                      onClick={onGenerateText}
                      className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg active:scale-95"
                      title="Regenerar"
                    >
                      <RefreshCw size={20} className="text-green-400" />
                    </button>
                  </div>
                  
                  <div className="bg-[#1a1a1a] p-4 rounded-xl mb-4 max-h-64 overflow-y-auto">
                    <pre className="text-gray-100 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedAd}
                    </pre>
                  </div>

                  <button
                    onClick={onCopyToClipboard}
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg active:scale-95 ${
                      copySuccess
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    }`}
                  >
                    {copySuccess ? <CheckCircle size={20} /> : <Copy size={20} />}
                    {copySuccess ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>
              )}

              {/* Canvas para banner */}
              {adMode === 'banner' && (
                <div className="space-y-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full max-w-sm mx-auto border border-gray-600 rounded-xl bg-[#1a1a1a]"
                    style={{ aspectRatio: '1/1' }}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={onGenerateBanner}
                      className="flex-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <RefreshCw size={18} />
                      Regenerar
                    </button>
                    <button
                      onClick={onDownloadBanner}
                      className="flex-1 bg-gradient-to-r from-[#FFD600] to-[#FFC400] hover:from-[#FFC400] hover:to-[#FFD600] text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Download size={18} />
                      Descargar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-[#1a1a1a] p-4 flex items-center justify-between border-t border-gray-600">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium transition-colors active:scale-95"
          >
            <ChevronUp size={20} />
            Anterior
          </button>
          
          <span className="text-gray-400">
            {currentStep + 1} de {steps.length}
          </span>
          
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFD600] hover:bg-[#FFC400] disabled:bg-gray-800 disabled:text-gray-500 text-black font-medium transition-colors active:scale-95"
          >
            Siguiente
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CollaboratorProductCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [collaboratorName, setCollaboratorName] = useState('María González');
  const [collaboratorPhone, setCollaboratorPhone] = useState('+57 300 123 4567');
  const [customMessage, setCustomMessage] = useState('');
  const [generatedAd, setGeneratedAd] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customPrices, setCustomPrices] = useState<{[key: string]: number}>({});
  const [adMode, setAdMode] = useState<AdMode>('text');
  const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate>('modern');
  const [bannerStyle, setBannerStyle] = useState<BannerStyle>({
    primaryColor: '#FFD600',
    secondaryColor: '#FFC400',
    textColor: '#FFFFFF',
    gradientType: 'linear'
  });
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filtrado memoizado de productos
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    return filtered;
  }, [searchTerm, selectedCategory, products]);

  // Categorías únicas memoizadas
  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(products.map(p => p.category)))],
    [products]
  );

  // Cálculos memoizados
  const comboCalculations = useMemo(() => {
    const total = selectedProducts.reduce((sum, product) => {
      const customPrice = customPrices[product.id] || product.price;
      return sum + customPrice;
    }, 0);

    const originalTotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);
    const profit = total - originalTotal;

    const getComboName = () => {
      const count = selectedProducts.length;
      if (count === 2) return 'Dúo Especial';
      if (count === 3) return 'Trío Exclusivo';
      if (count === 4) return 'Combo Premium';
      if (count >= 5) return 'Mega Combo';
      return 'Oferta Especial';
    };

    return { total, profit, comboName: getComboName() };
  }, [selectedProducts, customPrices]);

  // Cargar productos optimizado
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('category'));
        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;

        const productsData: Product[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Producto sin nombre',
            description: data.description || '',
            longDescription: data.longDescription || '',
            category: data.category || 'general',
            planType: data.planType || 'Estándar',
            price: data.price || 0,
            originalPrice: data.originalPrice || data.price || 0,
            discount: data.discount || 0,
            rating: data.rating || 4.0,
            reviews: data.reviews || 0,
            imageUrl: data.imageUrl || '',
            duration: data.duration || '30 días',
            devices: data.devices || 'Hasta 1 dispositivo',
            inStock: data.inStock !== undefined ? data.inStock : true
          } as Product;
        });
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers optimizados
  const toggleProductSelection = useCallback((product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      
      if (isSelected) {
        // Remover producto y limpiar precio personalizado
        setCustomPrices(prevPrices => {
          const newPrices = {...prevPrices};
          delete newPrices[product.id];
          return newPrices;
        });
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const updateCustomPrice = useCallback((productId: string, price: number) => {
    setCustomPrices(prev => ({
      ...prev,
      [productId]: Math.max(0, price)
    }));
  }, []);

  // Generadores de texto optimizados
  const adGenerators = useMemo(() => ({
    modern: () => {
      if (selectedProducts.length === 1) {
        const product = selectedProducts[0];
        const finalPrice = customPrices[product.id] || product.price;
        const discount = product.price > 0 ? Math.round(((product.price - finalPrice) / product.price) * 100) : 0;
        
        const discountText = discount > 0 ? 
          `💥 ¡${Math.abs(discount)}% de ${discount > 0 ? 'DESCUENTO' : 'RECARGO'}!\n🔥 Precio especial: ${finalPrice.toLocaleString()}` :
          `💰 Precio: ${finalPrice.toLocaleString()}`;

        return `✨ ${product.name} ✨

${product.description}

${discountText}
⭐ Calificación: ${product.rating}/5 (${product.reviews} reseñas)
📱 Compatible: ${product.devices}
⏰ Duración: ${product.duration}

${customMessage ? `💬 ${customMessage}\n` : ''}

📞 ¡Contáctame para más información!
👤 ${collaboratorName}${collaboratorPhone ? `\n📱 ${collaboratorPhone}` : ''}`;
      } else {
        const { total, comboName, profit } = comboCalculations;
        
        let productsList = '';
        selectedProducts.forEach((product, index) => {
          const finalPrice = customPrices[product.id] || product.price;
          productsList += `${index + 1}. ${product.name} - ${finalPrice.toLocaleString()}\n`;
        });

        return `🎁 ${comboName} 🎁

${selectedProducts.length} servicios premium por solo:
🔥 ${total.toLocaleString()} 🔥

${profit > 0 ? `💰 ¡Ganancia de ${profit.toLocaleString()}! 💰\n` : ''}

Incluye:
${productsList}
⏰ Duración: ${selectedProducts[0].duration} (todos los servicios)

${customMessage ? `💬 ${customMessage}\n` : ''}

📞 ¡No pierdas esta oportunidad!
👤 ${collaboratorName}${collaboratorPhone ? `\n📱 ${collaboratorPhone}` : ''}`;
      }
    },
    story: () => {
      if (selectedProducts.length === 1) {
        const product = selectedProducts[0];
        const finalPrice = customPrices[product.id] || product.price;
        
        return `🔥 ¡OFERTA IMPERDIBLE! 🔥

${product.name}

${finalPrice !== product.price ? 
          `🎯 PRECIO BASE: ${product.price.toLocaleString()}\n💥 PRECIO FINAL: ${finalPrice.toLocaleString()}\n${finalPrice > product.price ? '🔥 ¡PRECIO ESPECIAL!' : '💰 ¡OFERTA!'}` :
          `💰 Solo ${finalPrice.toLocaleString()}`}

${customMessage ? `"${customMessage}"\n` : ''}

📩 Escríbeme: ${collaboratorName}
${collaboratorPhone ? `📞 ${collaboratorPhone}` : ''}

¡No te quedes sin el tuyo! 🏃‍♂️💨`;
      } else {
        const { total, comboName, profit } = comboCalculations;
        
        return `🎪 ¡${comboName.toUpperCase()}! 🎪

${selectedProducts.length} SERVICIOS PREMIUM

Precio especial: ${total.toLocaleString()}
${profit > 0 ? `🔥 ¡GANANCIA DE ${profit.toLocaleString()}! 🔥\n` : ''}

${customMessage ? `"${customMessage}"\n` : ''}

🚀 Oferta por tiempo limitado
👤 ${collaboratorName}
${collaboratorPhone ? `📞 ${collaboratorPhone}` : ''}

¡Aprovecha ahora! ⚡`;
      }
    },
    professional: () => {
      if (selectedProducts.length === 1) {
        const product = selectedProducts[0];
        const finalPrice = customPrices[product.id] || product.price;
        
        return `${product.name}

Especificaciones:
• ${product.description}
• Duración: ${product.duration}
• Dispositivos: ${product.devices}
• Calificación: ${product.rating}/5
• Plan: ${product.planType}

${finalPrice !== product.price ? 
          `Precio base: ${product.price.toLocaleString()}\nPrecio final: ${finalPrice.toLocaleString()}` :
          `Precio: ${finalPrice.toLocaleString()}`}

${customMessage ? `${customMessage}\n` : ''}

Para consultas y pedidos:
${collaboratorName}${collaboratorPhone ? ` - ${collaboratorPhone}` : ''}

Asesoría especializada y soporte incluido.`;
      } else {
        const { total, comboName } = comboCalculations;
        
        let productsList = '';
        selectedProducts.forEach((product, index) => {
          const finalPrice = customPrices[product.id] || product.price;
          productsList += `• ${product.name} - ${finalPrice.toLocaleString()}\n`;
        });

        return `${comboName} - Servicios Digitales

Paquete incluye:
${productsList}
Total: ${total.toLocaleString()}

Beneficios:
• Acceso simultáneo a múltiples plataformas
• Soporte técnico incluido
• Garantía de satisfacción

${customMessage ? `${customMessage}\n` : ''}

Contacto para adquirir:
${collaboratorName}${collaboratorPhone ? ` - ${collaboratorPhone}` : ''}

Oferta profesional con condiciones especiales.`;
      }
    },
    casual: () => {
      const emojis = ['🎮', '📱', '💻', '🎧', '📺', '⚡'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      if (selectedProducts.length === 1) {
        const product = selectedProducts[0];
        const finalPrice = customPrices[product.id] || product.price;
        
        return `Hola! ${randomEmoji}

Te recomiendo ${product.name}

${product.description}

${finalPrice !== product.price ? 
          `Precio especial: ${finalPrice.toLocaleString()} (base ${product.price.toLocaleString()})` :
          `Por solo ${finalPrice.toLocaleString()}`}

${customMessage ? `${customMessage}\n` : ''}

Si te interesa, escríbeme!
${collaboratorName}${collaboratorPhone ? ` (${collaboratorPhone})` : ''}

${randomEmoji} ¡Saludos!`;
      } else {
        const { total, comboName } = comboCalculations;
        
        return `Hola! ${randomEmoji}

Tengo una súper oferta de ${comboName.toLowerCase()} para ti:

${selectedProducts.map(p => `• ${p.name}`).join('\n')}

Todo por solo ${total.toLocaleString()}! ${randomEmoji}

${customMessage ? `${customMessage}\n` : ''}

¿Te interesa? Escríbeme 😊
${collaboratorName}${collaboratorPhone ? ` (${collaboratorPhone})` : ''}

¡No pierdas esta oportunidad! 🚀`;
      }
    }
  }), [selectedProducts, customPrices, comboCalculations, customMessage, collaboratorName, collaboratorPhone]);

  const generateTextAd = useCallback(() => {
    if (selectedProducts.length === 0 || !collaboratorName) return;

    const generator = adGenerators[selectedTemplate];
    if (generator) {
      setGeneratedAd(generator());
    }
  }, [selectedProducts, collaboratorName, selectedTemplate, adGenerators]);

  const generateBanner = useCallback(async () => {
    if (selectedProducts.length === 0 || !canvasRef.current) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Configurar canvas para móvil
    canvas.width = 600;
    canvas.height = 600;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Crear fondo con gradiente
    let gradient;
    switch (bannerStyle.gradientType) {
      case 'radial':
        gradient = ctx.createRadialGradient(
          canvas.width / 2, 
          canvas.height / 2, 
          0, 
          canvas.width / 2, 
          canvas.height / 2, 
          canvas.width / 1.5
        );
        break;
      case 'diagonal':
        gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        break;
      case 'horizontal':
        gradient = ctx.createLinearGradient(0, canvas.height / 2, canvas.width, canvas.height / 2);
        break;
      case 'vertical':
        gradient = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height);
        break;
      default:
        gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        break;
    }
    
    gradient.addColorStop(0, bannerStyle.primaryColor);
    gradient.addColorStop(1, bannerStyle.secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configurar texto
    ctx.fillStyle = bannerStyle.textColor;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;

    // Renderizar contenido optimizado para móvil
    if (selectedProducts.length === 1) {
      const product = selectedProducts[0];
      const finalPrice = customPrices[product.id] || product.price;
      
      ctx.font = 'bold 36px Arial';
      ctx.fillText(product.name, canvas.width / 2, 100);

      ctx.font = '22px Arial';
      ctx.fillText(product.description.substring(0, 40) + '...', canvas.width / 2, 140);

      ctx.font = 'bold 48px Arial';
      ctx.fillText(`${finalPrice.toLocaleString()}`, canvas.width / 2, 220);

      if (finalPrice !== product.price) {
        ctx.font = '24px Arial';
        const textColor = finalPrice > product.price ? '#FFB84D' : '#FF6B6B';
        ctx.fillStyle = textColor;
        ctx.fillText(`Base: ${product.price.toLocaleString()}`, canvas.width / 2, 260);
        ctx.fillStyle = bannerStyle.textColor;
        
        const label = finalPrice > product.price ? '¡PRECIO ESPECIAL!' : '¡OFERTA!';
        ctx.fillText(label, canvas.width / 2, 300);
      }
    } else {
      const { total, comboName } = comboCalculations;
      
      ctx.font = 'bold 32px Arial';
      ctx.fillText(comboName, canvas.width / 2, 80);
      
      ctx.font = '24px Arial';
      ctx.fillText(`${selectedProducts.length} Servicios Premium`, canvas.width / 2, 120);
      
      ctx.font = 'bold 52px Arial';
      ctx.fillText(`${total.toLocaleString()}`, canvas.width / 2, 200);
      
      ctx.font = '20px Arial';
      ctx.fillText('Precio especial por tiempo limitado', canvas.width / 2, 240);
      
      // Lista simplificada para móvil
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      const maxItems = Math.min(selectedProducts.length, 3);
      for (let i = 0; i < maxItems; i++) {
        const yPos = 280 + (i * 25);
        ctx.fillText(`✓ ${selectedProducts[i].name}`, canvas.width / 6, yPos);
      }
      if (selectedProducts.length > 3) {
        ctx.fillText(`+ ${selectedProducts.length - 3} más...`, canvas.width / 6, 280 + (3 * 25));
      }
      ctx.textAlign = 'center';
    }

    // Info del colaborador
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`Contacto: ${collaboratorName}`, canvas.width / 2, 480);
    
    if (collaboratorPhone) {
      ctx.font = '18px Arial';
      ctx.fillText(collaboratorPhone, canvas.width / 2, 510);
    }

    setIsGenerating(false);
  }, [selectedProducts, customPrices, bannerStyle, comboCalculations, collaboratorName, collaboratorPhone]);

  const downloadBanner = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${selectedProducts.length === 1 ? selectedProducts[0].name : comboCalculations.comboName}_banner.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  }, [selectedProducts, comboCalculations.comboName]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedAd);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }, [generatedAd]);

  // Componente de carga optimizado para móvil
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] p-4">
        <div className="flex flex-col items-center p-8 bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-700/50 max-w-sm w-full">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FFD600]/20 border-t-[#FFD600] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-[#FFD600] font-bold text-lg text-center">Cargando productos</p>
          <p className="text-gray-400 text-sm text-center mt-2">Preparando tu catálogo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] pb-24">
      {/* Header simplificado para móvil */}
      <div className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/collaborations')}
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 active:bg-black/40 px-4 py-2 rounded-xl transition-all font-medium text-black active:scale-95"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Volver</span>
          </button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className="text-xl sm:text-2xl font-bold text-black">Catálogo</h1>
            <p className="text-black/70 font-medium text-sm hidden sm:block">Crea publicidad fácil</p>
          </div>

          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4">
        {/* Controles de búsqueda simplificados */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-2xl py-4 pl-12 pr-4 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50 focus:border-[#FFD600]/50 transition-all duration-300"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-600 rounded-2xl py-4 px-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#FFD600]/50 focus:border-[#FFD600]/50 transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de productos optimizada para móvil */}
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <MobileProductCard
              key={product.id}
              product={product}
              isSelected={selectedProducts.some(p => p.id === product.id)}
              onToggle={toggleProductSelection}
            />
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Package size={64} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-300 text-lg">No se encontraron productos</p>
              <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen flotante */}
      <MobileCartSummary
        selectedProducts={selectedProducts}
        customPrices={customPrices}
        total={comboCalculations.total}
        profit={comboCalculations.profit}
        comboName={comboCalculations.comboName}
        onOpenGenerator={() => setShowGeneratorModal(true)}
      />

      {/* Modal del generador */}
      <MobileGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        selectedProducts={selectedProducts}
        customPrices={customPrices}
        onUpdatePrice={updateCustomPrice}
        comboCalculations={comboCalculations}
        collaboratorName={collaboratorName}
        setCollaboratorName={setCollaboratorName}
        collaboratorPhone={collaboratorPhone}
        setCollaboratorPhone={setCollaboratorPhone}
        customMessage={customMessage}
        setCustomMessage={setCustomMessage}
        adMode={adMode}
        setAdMode={setAdMode}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        bannerStyle={bannerStyle}
        setBannerStyle={setBannerStyle}
        onGenerateText={generateTextAd}
        onGenerateBanner={generateBanner}
        generatedAd={generatedAd}
        isGenerating={isGenerating}
        copySuccess={copySuccess}
        onCopyToClipboard={copyToClipboard}
        canvasRef={canvasRef}
        onDownloadBanner={downloadBanner}
      />
    </div>
  );
};

export default CollaboratorProductCatalog;