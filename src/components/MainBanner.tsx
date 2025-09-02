import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Star, Play, RefreshCw, Sparkles, TrendingUp, Grid, Filter, Music, Gamepad2, Wrench, BookOpen, GraduationCap } from 'lucide-react';

interface MainBannerProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

interface RecommendedContent {
  title: string;
  platform: string;
  genre: string;
  rating: number;
  releaseDate: string;
  description: string;
  platformColor: string;
  trending: boolean;
  contentType: 'serie' | 'pelicula';
  isError?: boolean;
}

// Mover constantes fuera del componente para evitar recreación
const PLATFORMS = [
  'Netflix','Amazon Prime Video','HBO Max','Disney+','Apple TV+',
  'Paramount+','Crunchyroll','MUBI','Spotify','YouTube Premium',
  'Game Pass Ultimate','Duolingo Plus','ChatGPT Plus','Canva',
  'CapCut','Emby','Flujo TV','Gaia','IPTV','NBA League Pass',
  'MLS Pass','Plex','Rakuten Viki','Tidal','TV Mia','Universal+',
  'Win Sports','Telelatino Premium','Apple Music','Mistery Box'
];

const GENRES = ['Drama', 'Comedia', 'Acción', 'Thriller', 'Ciencia Ficción', 'Fantasía', 'Romance', 'Documental', 'Animación', 'Terror', 'Misterio', 'Aventura'];
const YEARS = ['2024', '2023', '2025'];

const CATEGORY_DATA = [
  { key: 'all', label: 'Todos', icon: Grid },
  { key: 'video', label: 'Video', icon: Sparkles },
  { key: 'music', label: 'Música', icon: Music },
  { key: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { key: 'tools', label: 'Herramientas', icon: Wrench },
  { key: 'productivity', label: 'Productividad', icon: BookOpen },
  { key: 'education', label: 'Educación', icon: GraduationCap }
];

const REFRESH_INTERVAL = 50000; // 50 segundos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Función de parsing optimizada y memoizada
const safeParseJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch {
    // Cleanup simplificado - una sola pasada
    const cleaned = jsonString
      .trim()
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
      .replace(/'/g, '"');

    try {
      return JSON.parse(cleaned);
    } catch {
      throw new Error('Unable to parse JSON response');
    }
  }
};

// Función para generar contenido de fallback
const generateFallbackContent = (isError = false): RecommendedContent => ({
  title: isError ? 'Error de conexión' : 'Configuración requerida',
  platform: 'Sistema',
  genre: isError ? 'Error' : 'Configuración',
  rating: 0,
  releaseDate: isError ? 'Ahora' : 'Hoy',
  description: isError ? 'No se pudo obtener recomendación' : 'Configura tu API key de Groq para recomendaciones',
  platformColor: '#FF6B6B',
  trending: false,
  contentType: 'serie',
  isError: true
});

const MainBanner: React.FC<MainBannerProps> = ({ selectedCategory = 'all', onCategoryChange }) => {
  const [content, setContent] = useState<RecommendedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [fadeClass, setFadeClass] = useState('opacity-100');
  const [previousRecommendations, setPreviousRecommendations] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  // Memoizar API key para evitar recálculos
  const apiKey = useMemo(() => import.meta.env.VITE_GROQ_API_KEY, []);

  // Función optimizada para crear prompt de recomendación
  const createRecommendationPrompt = useCallback((previousTitles: string[]) => {
    const randomPlatform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
    const randomYear = YEARS[Math.floor(Math.random() * YEARS.length)];
    const randomContentType = Math.random() > 0.5 ? 'serie' : 'pelicula';
    
    const exclusionText = previousTitles.length > 0 
      ? `\n\nIMPORTANTE: NO recomiendes: ${previousTitles.slice(-5).join(', ')}` // Solo últimos 5
      : '';

    return `Recomienda una ${randomContentType} de ${randomGenre} del ${randomYear} disponible en ${randomPlatform}.

Responde ÚNICAMENTE con JSON válido:

{
  "title": "nombre específico",
  "platform": "plataforma de streaming",
  "genre": "${randomGenre}",
  "rating": número_entre_7.0_y_9.9,
  "releaseDate": "formato como 'Enero 2025'",
  "description": "descripción de máximo 80 caracteres",
  "platformColor": "color hex",
  "trending": true,
  "contentType": "${randomContentType}"
}${exclusionText}`;
  }, []);

  // Función de fetch optimizada con retry y timeout
  const fetchWithRetry = useCallback(async (url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (retries > 0 && (error as Error).name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }, []);

  // Función principal de fetch optimizada
  const fetchRecommendation = useCallback(async () => {
    if (!apiKey) {
      setContent(generateFallbackContent(false));
      return;
    }

    // Evitar múltiples requests simultáneos
    if (loading) return;

    setLoading(true);
    setFadeClass('opacity-50');
    setRetryCount(0);

    try {
      const prompt = createRecommendationPrompt(previousRecommendations);

      const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
          max_tokens: 300 // Reducido de 400
        })
      });

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content?.trim();
      
      if (!rawContent) throw new Error('Empty response');

      // Parsing optimizado - buscar solo el primer objeto JSON válido
      const jsonStart = rawContent.indexOf('{');
      const jsonEnd = rawContent.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found');
      
      const jsonString = rawContent.substring(jsonStart, jsonEnd + 1);
      const parsed = safeParseJSON(jsonString);

      // Validación optimizada
      const validated: RecommendedContent = {
        title: parsed.title || 'Contenido Destacado',
        platform: PLATFORMS.includes(parsed.platform) 
          ? parsed.platform 
          : PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
        genre: parsed.genre || 'Entretenimiento',
        rating: Math.max(7.0, Math.min(9.9, parsed.rating ?? 8.5)),
        releaseDate: parsed.releaseDate || 'Disponible ahora',
        description: (parsed.description ?? '').substring(0, 80),
        platformColor: parsed.platformColor || '#FEE440',
        trending: parsed.trending !== false,
        contentType: parsed.contentType === 'pelicula' ? 'pelicula' : 'serie'
      };

      // Actualizar historial (solo últimos 5 para ahorrar memoria)
      setPreviousRecommendations(prev => 
        [...prev, validated.title].slice(-5)
      );

      // Aplicar cambios con delay para suavidad visual
      setTimeout(() => {
        setContent(validated);
        setFadeClass('opacity-100');
      }, 200); // Reducido de 300ms

    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setContent(generateFallbackContent(true));
      setFadeClass('opacity-100');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [apiKey, createRecommendationPrompt, previousRecommendations, loading, fetchWithRetry]);

  // Handler optimizado para el click del botón "Ver"
  const handleWatchClick = useCallback(() => {
    if (content && !content.isError) {
      window.location.href = `/?search=${encodeURIComponent(content.platform.toLowerCase())}`;
    }
  }, [content]);

  // Effect optimizado con cleanup adecuado
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    // Fetch inicial
    fetchRecommendation();
    
    // Configurar intervalo solo si hay API key
    if (apiKey) {
      intervalId = setInterval(fetchRecommendation, REFRESH_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [apiKey, fetchRecommendation]);

  // Componente de carga optimizado
  const LoadingComponent = useMemo(() => (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#FEE440] animate-spin" />
          <p className="text-white/70 text-sm">Cargando...</p>
        </div>
      </div>
    </div>
  ), []);

  // Renderizado de categoría optimizado
  const CategoryButton = React.memo(({ category, isSelected, onClick }: { 
    category: typeof CATEGORY_DATA[0], 
    isSelected: boolean, 
    onClick: () => void 
  }) => {
    const IconComponent = category.icon;
    
    return (
      <div className="relative flex-shrink-0">
        <button
          onClick={onClick}
          className={`group relative px-4 py-3 font-medium text-sm transition-all duration-300 flex flex-col items-center gap-1.5 min-w-[80px] lg:min-w-0 lg:w-full ${
            isSelected
              ? 'bg-gradient-to-b from-[#FEE440] via-[#FEE440] to-transparent text-black shadow-lg shadow-[#FEE440]/30 transform scale-105'
              : 'bg-gradient-to-b from-white/5 via-white/5 to-transparent text-white/80 hover:from-white/10 hover:via-white/10 hover:to-transparent hover:text-white hover:shadow-lg border-b border-white/10 hover:border-[#FEE440]/50'
          } rounded-t-2xl border-t border-l border-r ${
            isSelected 
              ? 'border-[#FEE440]/50' 
              : 'border-white/10 hover:border-[#FEE440]/30'
          }`}
          style={{
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
            borderBottom: 'none'
          }}
        >
          <IconComponent className={`w-4 h-4 ${isSelected ? '' : 'group-hover:text-[#FEE440]'} transition-colors flex-shrink-0`} />
          <span className="text-xs leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full lg:block">
            {category.label}
          </span>
          {isSelected && (
            <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-[#FEE440]/20 via-[#FEE440]/10 to-transparent animate-pulse pointer-events-none" />
          )}
        </button>
        
        <div 
          className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
            isSelected 
              ? 'bg-gradient-to-r from-transparent via-[#FEE440] to-transparent' 
              : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-white/30 group-hover:to-transparent'
          }`}
          style={{ 
            transform: 'translateY(1px)',
            zIndex: 10
          }}
        />
      </div>
    );
  });

  // Callback optimizado para cambio de categoría
  const handleCategoryChange = useCallback((categoryKey: string) => {
    onCategoryChange?.(categoryKey);
  }, [onCategoryChange]);

  // Early return para loading
  if (!content) {
    return LoadingComponent;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Banner de recomendación */}
        <div className="lg:col-span-5 w-full">
          <div
            className={`bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl hover:shadow-[#FEE440]/20 transition-all duration-300 ${fadeClass} h-48`}
          >
            <div className="h-full flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  {content.trending && (
                    <div className="bg-red-500 rounded-full px-2 py-0.5 flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-bold">HOT</span>
                    </div>
                  )}
                  <div className="bg-white/10 rounded-full px-2 py-0.5">
                    <span className="text-white/80 text-xs font-medium">
                      {content.contentType === 'serie' ? 'SERIE' : 'PELÍCULA'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={fetchRecommendation}
                  disabled={loading}
                  className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors disabled:opacity-50"
                  aria-label="Actualizar recomendación"
                >
                  <RefreshCw className={`w-3 h-3 text-white/70 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1 line-clamp-2 leading-tight">
                  {content.title}
                </h3>

                <p className="text-white/70 text-xs mb-2 line-clamp-2 leading-relaxed">
                  {content.description}
                </p>

                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 font-semibold text-xs">
                      {content.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-full px-2 py-0.5">
                    <span className="text-white/80 text-xs">{content.genre}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div 
                  className="rounded-full px-2 py-1 text-center"
                  style={{ backgroundColor: content.platformColor }}
                >
                  <span className="text-black font-semibold text-xs">
                    {content.platform}
                  </span>
                </div>

                {!content.isError && (
                  <button
                    onClick={handleWatchClick}
                    className="bg-[#FEE440] hover:bg-[#FFBA00] text-black font-semibold py-1.5 px-3 rounded-lg flex items-center space-x-1 transition-colors active:scale-95 text-xs"
                  >
                    <Play className="w-3 h-3" />
                    <span>Ver</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl h-48 overflow-hidden">
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <Filter className="w-5 h-5 text-[#FEE440]" />
                <h3 className="text-white font-semibold text-base">Filtrar por categoría</h3>
              </div>
              
              <div className="flex-1">
                {/* Desktop: Grid */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-7 gap-2">
                    {CATEGORY_DATA.map((category) => (
                      <CategoryButton
                        key={category.key}
                        category={category}
                        isSelected={selectedCategory === category.key}
                        onClick={() => handleCategoryChange(category.key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile: Scroll horizontal */}
                <div className="lg:hidden">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mr-6 pr-6">
                    {CATEGORY_DATA.map((category) => (
                      <CategoryButton
                        key={category.key}
                        category={category}
                        isSelected={selectedCategory === category.key}
                        onClick={() => handleCategoryChange(category.key)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS optimizado */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MainBanner;