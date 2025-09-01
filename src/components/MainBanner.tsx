import React, { useState, useEffect } from 'react';
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

const MainBanner: React.FC<MainBannerProps> = ({ selectedCategory = 'all', onCategoryChange }) => {
  const [content, setContent] = useState<RecommendedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [fadeClass, setFadeClass] = useState('opacity-100');
  const [previousRecommendations, setPreviousRecommendations] = useState<string[]>([]);

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const platforms = [
    'Netflix','Amazon Prime Video','HBO Max','Disney+','Apple TV+',
    'Paramount+','Crunchyroll','MUBI','Spotify','YouTube Premium',
    'Game Pass Ultimate','Duolingo Plus','ChatGPT Plus','Canva',
    'CapCut','Emby','Flujo TV','Gaia','IPTV','NBA League Pass',
    'MLS Pass','Plex','Rakuten Viki','Tidal','TV Mia','Universal+',
    'Win Sports','Telelatino Premium','Apple Music','Mistery Box'
  ];

  const categoryData = [
    { key: 'all', label: 'Todos', icon: Grid },
    { key: 'video', label: 'Video', icon: Sparkles },
    { key: 'music', label: 'Música', icon: Music },
    { key: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { key: 'tools', label: 'Herramientas', icon: Wrench },
    { key: 'productivity', label: 'Productividad', icon: BookOpen },
    { key: 'education', label: 'Educación', icon: GraduationCap }
  ];

  const safeParseJSON = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.log('Standard JSON.parse failed, trying cleanup...');
    }

    let cleaned = jsonString
      .trim()
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
      .replace(/'/g, '"');

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.log('Cleaned JSON parse failed, using eval as last resort...');
      try {
        return eval('(' + jsonString + ')');
      } catch (evalError) {
        throw new Error('Unable to parse JSON response');
      }
    }
  };

  const fetchRecommendation = async () => {
    if (!apiKey) {
      setContent({
        title: 'Configuración requerida',
        platform: 'Sistema',
        genre: 'Configuración',
        rating: 0,
        releaseDate: 'Hoy',
        description: 'Configura tu API key de Groq para recomendaciones',
        platformColor: '#FF6B6B',
        trending: false,
        contentType: 'serie',
        isError: true
      });
      return;
    }

    setLoading(true);
    setFadeClass('opacity-50');

    try {
      const randomGenres = ['Drama', 'Comedia', 'Acción', 'Thriller', 'Ciencia Ficción', 'Fantasía', 'Romance', 'Documental', 'Animación', 'Terror', 'Misterio', 'Aventura'];
      const randomYears = ['2024', '2023', '2025'];
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
      const randomGenre = randomGenres[Math.floor(Math.random() * randomGenres.length)];
      const randomYear = randomYears[Math.floor(Math.random() * randomYears.length)];
      const randomContentType = Math.random() > 0.5 ? 'serie' : 'pelicula';
      
      const exclusionText = previousRecommendations.length > 0 
        ? `\n\nIMPORTANTE: NO recomiendes ninguno de estos títulos que ya fueron sugeridos: ${previousRecommendations.join(', ')}`
        : '';

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{
            role: 'user',
            content: `Recomienda una ${randomContentType} de ${randomGenre} del ${randomYear} disponible en ${randomPlatform} o cualquier plataforma de streaming. Busca contenido DIFERENTE y VARIADO cada vez.

Responde ÚNICAMENTE con JSON válido sin explicaciones adicionales:

{
  "title": "nombre específico del contenido",
  "platform": "una de estas plataformas: ${platforms.join(', ')}",
  "genre": "${randomGenre} o género relacionado",
  "rating": número_entre_7.0_y_9.9,
  "releaseDate": "formato como 'Enero 2025' o 'Diciembre 2024'",
  "description": "descripción atractiva en español de máximo 80 caracteres",
  "platformColor": "color hex apropiado para la plataforma",
  "trending": true,
  "contentType": "${randomContentType}"
}

Sugiere contenido REAL y ESPECÍFICO que sea diferente cada vez. Varía entre series populares, películas actuales, documentales, anime, etc.${exclusionText}

IMPORTANTE: Responde solo con el objeto JSON, sin texto adicional antes o después.`
          }],
          temperature: 0.9,
          max_tokens: 400
        })
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      const raw = data.choices[0].message.content.trim();

      let jsonString = raw;
      
      const start = raw.indexOf('{');
      if (start >= 0) {
        let braceCount = 0;
        let end = -1;
        
        for (let i = start; i < raw.length; i++) {
          if (raw[i] === '{') braceCount++;
          if (raw[i] === '}') braceCount--;
          if (braceCount === 0) {
            end = i;
            break;
          }
        }
        
        if (end >= 0) {
          jsonString = raw.substring(start, end + 1);
        }
      }

      const parsed = safeParseJSON(jsonString);

      const validated: RecommendedContent = {
        title: parsed.title || 'Contenido Destacado',
        platform: platforms.includes(parsed.platform)
          ? parsed.platform
          : platforms[Math.floor(Math.random() * platforms.length)],
        genre: parsed.genre || 'Entretenimiento',
        rating: Math.max(7.0, Math.min(9.9, parsed.rating ?? 8.5)),
        releaseDate: parsed.releaseDate || 'Disponible ahora',
        description: (parsed.description ?? '').substring(0, 80),
        platformColor: parsed.platformColor || '#FEE440',
        trending: parsed.trending !== false,
        contentType: parsed.contentType === 'pelicula' ? 'pelicula' : 'serie'
      };

      setPreviousRecommendations(prev => {
        const updated = [...prev, validated.title];
        return updated.slice(-10);
      });

      setTimeout(() => {
        setContent(validated);
        setFadeClass('opacity-100');
      }, 300);

    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setContent({
        title: 'Error de conexión',
        platform: 'Sistema',
        genre: 'Error',
        rating: 0,
        releaseDate: 'Ahora',
        description: 'No se pudo obtener recomendación',
        platformColor: '#FF6B6B',
        trending: false,
        contentType: 'serie',
        isError: true
      });
      setFadeClass('opacity-100');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchClick = () => {
    if (content && !content.isError) {
      window.location.href = `/?search=${encodeURIComponent(content.platform.toLowerCase())}`;
    }
  };

  useEffect(() => {
    fetchRecommendation();
    const iv = setInterval(fetchRecommendation, 50000);
    return () => clearInterval(iv);
  }, [apiKey]);

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#FEE440] animate-spin" />
            <p className="text-white/70 text-sm">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Layout ajustado: Banner más amplio, categorías más compactas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Banner de recomendación - expandido */}
        <div className="lg:col-span-5 w-full">
          <div
            className={`bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl hover:shadow-[#FEE440]/20 transition-all duration-300 ${fadeClass} h-48`}
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <div className="h-full flex flex-col justify-between">
              {/* Header compacto */}
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
                >
                  <RefreshCw className={`w-3 h-3 text-white/70 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Contenido compacto */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1 line-clamp-2 leading-tight">
                  {content.title}
                </h3>

                <p className="text-white/70 text-xs mb-2 line-clamp-2 leading-relaxed">
                  {content.description}
                </p>

                {/* Rating y género compactos */}
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

              {/* Footer compacto */}
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

        {/* Categorías - más compacto con diseño semi-conectado */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl h-48 overflow-hidden relative">
            <div className="h-full flex flex-col p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <Filter className="w-5 h-5 text-[#FEE440]" />
                <h3 className="text-white font-semibold text-base">Filtrar por categoría</h3>
              </div>
              
              {/* Contenedor de pills rediseñado */}
              <div className="flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                  {categoryData.map((category, index) => {
                    const IconComponent = category.icon;
                    const isSelected = selectedCategory === category.key;
                    return (
                      <div key={category.key} className="relative">
                        <button
                          onClick={() => onCategoryChange?.(category.key)}
                          className={`group relative w-full px-3 py-3 font-medium text-sm transition-all duration-300 flex flex-col items-center gap-1.5 ${
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
                          <span className="text-xs leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                            {category.label}
                          </span>
                          {isSelected && (
                            <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-[#FEE440]/20 via-[#FEE440]/10 to-transparent animate-pulse pointer-events-none" />
                          )}
                        </button>
                        
                        {/* Línea de conexión al borde inferior */}
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
                  })}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Estilos para ocultar scrollbar */}
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