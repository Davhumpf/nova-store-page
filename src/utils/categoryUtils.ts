// Utilidades para manejo de categorías
export interface CategoryData {
  key: string;
  label: string;
  keywords: string[];
}

export const CATEGORIES: CategoryData[] = [
  {
    key: 'all',
    label: 'Todos',
    keywords: []
  },
  {
    key: 'video',
    label: 'Video',
    keywords: ['video', 'streaming', 'netflix', 'prime', 'hbo', 'disney', 'youtube', 'tv', 'series', 'movies', 'peliculas']
  },
  {
    key: 'music',
    label: 'Música',
    keywords: ['music', 'música', 'spotify', 'apple music', 'tidal', 'audio', 'playlist', 'songs']
  },
  {
    key: 'gaming',
    label: 'Gaming',
    keywords: ['gaming', 'games', 'game pass', 'xbox', 'playstation', 'nintendo', 'steam', 'juegos']
  },
  {
    key: 'tools',
    label: 'Herramientas',
    keywords: ['tools', 'herramientas', 'software', 'utilities', 'canva', 'capcut', 'adobe', 'design']
  },
  {
    key: 'education',
    label: 'Educación',
    keywords: ['education', 'educación', 'duolingo', 'courses', 'learning', 'study', 'academia', 'university']
  },
  {
    key: 'productivity',
    label: 'Productividad',
    keywords: ['productivity', 'productividad', 'office', 'work', 'business', 'microsoft', 'google', 'workspace']
  }
];

/**
 * Filtra productos por categoría
 * @param products Array de productos
 * @param categoryKey Clave de la categoría
 * @returns Array filtrado de productos
 */
export const filterProductsByCategory = (products: any[], categoryKey: string) => {
  if (categoryKey === 'all') {
    return products;
  }

  const category = CATEGORIES.find(cat => cat.key === categoryKey);
  if (!category || category.keywords.length === 0) {
    return products;
  }

  return products.filter(product => {
    const searchableText = [
      product.name || '',
      product.title || '',
      product.description || '',
      product.category || '',
      product.platform || ''
    ].join(' ').toLowerCase();

    return category.keywords.some(keyword => 
      searchableText.includes(keyword.toLowerCase())
    );
  });
};

/**
 * Obtiene el nombre para mostrar de una categoría
 * @param categoryKey Clave de la categoría
 * @returns Nombre para mostrar
 */
export const getCategoryDisplayName = (categoryKey: string): string => {
  const category = CATEGORIES.find(cat => cat.key === categoryKey);
  return category ? category.label : 'Productos';
};

/**
 * Obtiene estadísticas de productos por categoría
 * @param products Array de productos
 * @returns Objeto con conteo por categoría
 */
export const getCategoryStats = (products: any[]) => {
  const stats: { [key: string]: number } = {};
  
  CATEGORIES.forEach(category => {
    if (category.key === 'all') {
      stats[category.key] = products.length;
    } else {
      stats[category.key] = filterProductsByCategory(products, category.key).length;
    }
  });
  
  return stats;
};