import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { cacheKeys, cacheConfig } from '../lib/cache';

// Tipos para busca avançada
export interface SearchFilters {
  query?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  maxCookTime?: number;
  ingredients?: string[];
  tags?: string[];
  minRating?: number;
  servings?: number;
  dietaryRestrictions?: string[];
  cuisine?: string;
  sortBy?: 'relevance' | 'rating' | 'prep_time' | 'created_at' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  prep_time: number;
  cook_time?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  rating: number;
  category: string;
  tags: string[];
  ingredients: string[];
  servings: number;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  relevanceScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  suggestions?: string[];
  filters: {
    categories: Array<{ id: string; name: string; count: number }>;
    difficulties: Array<{ value: string; count: number }>;
    cuisines: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    prepTimeRanges: Array<{ min: number; max: number; count: number }>;
  };
}

export interface AutocompleteItem {
  id: string;
  text: string;
  type: 'recipe' | 'ingredient' | 'tag' | 'category' | 'cuisine';
  count?: number;
  image_url?: string;
}

// Hook principal para busca avançada
export function useAdvancedSearch(initialFilters: SearchFilters = {}, page: number = 1, limit: number = 20) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce da query de busca para otimizar performance
  const debouncedQuery = useDebounce(filters.query || '', 300);
  
  // Criar chave de cache única baseada nos filtros
  const searchKey = useMemo(() => {
    const filtersCopy = { ...filters, query: debouncedQuery };
    return [cacheKeys.search, filtersCopy, page, limit];
  }, [filters, debouncedQuery, page, limit]);

  // Query principal de busca
  const {
    data: searchData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: searchKey,
    queryFn: () => performSearch({ ...filters, query: debouncedQuery }, page, limit),
    enabled: !!(debouncedQuery || Object.keys(filters).length > 1),
    staleTime: cacheConfig.search.staleTime,
    gcTime: cacheConfig.search.gcTime,
    placeholderData: (previousData) => previousData
  });

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Função para resetar busca
  const resetSearch = useCallback(() => {
    setFilters({});
    setIsSearching(false);
  }, []);

  // Função para busca rápida
  const quickSearch = useCallback((query: string) => {
    setFilters({ query });
    setIsSearching(true);
  }, []);

  return {
    // Dados
    results: searchData?.results || [],
    total: searchData?.total || 0,
    totalPages: searchData?.totalPages || 0,
    suggestions: searchData?.suggestions || [],
    availableFilters: searchData?.filters,
    
    // Estados
    filters,
    isLoading: isLoading || isSearching,
    error,
    hasResults: (searchData?.results?.length || 0) > 0,
    hasFilters: Object.keys(filters).length > 0,
    
    // Ações
    updateFilters,
    clearFilters,
    resetSearch,
    quickSearch,
    refetch
  };
}

// Hook para autocomplete
export function useAutocomplete(query: string, types: AutocompleteItem['type'][] = ['recipe', 'ingredient']) {
  const debouncedQuery = useDebounce(query, 200);
  
  const {
    data: suggestions,
    isLoading
  } = useQuery({
    queryKey: cacheKeys.search.autocomplete(debouncedQuery, types),
    queryFn: () => getAutocompleteSuggestions(debouncedQuery, types),
    enabled: debouncedQuery.length >= 2,
    staleTime: cacheConfig.autocomplete.staleTime,
    gcTime: cacheConfig.autocomplete.gcTime
  });

  return {
    suggestions: suggestions || [],
    isLoading
  };
}

// Hook para ingredientes populares
export function usePopularIngredients(limit: number = 20) {
  const {
    data: ingredients,
    isLoading,
    error
  } = useQuery({
    queryKey: cacheKeys.search.popularIngredients(limit),
    queryFn: () => getPopularIngredients(limit),
    staleTime: cacheConfig.popularIngredients.staleTime,
    gcTime: cacheConfig.popularIngredients.gcTime
  });

  return {
    ingredients: ingredients || [],
    isLoading,
    error
  };
}

// Hook para histórico de buscas
export function useSearchHistory(limit: number = 10) {
  const [history, setHistory] = useState<string[]>([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('search-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Adicionar busca ao histórico
  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, limit);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [limit]);

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('search-history');
  }, []);

  // Remover item do histórico
  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item !== query);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
}

// Hook para filtros salvos
export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<Array<{ id: string; name: string; filters: SearchFilters }>>([]);

  // Carregar filtros salvos
  useEffect(() => {
    const saved = localStorage.getItem('saved-filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Salvar filtro
  const saveFilter = useCallback((name: string, filters: SearchFilters) => {
    const newFilter = {
      id: Date.now().toString(),
      name,
      filters
    };
    
    setSavedFilters(prev => {
      const newFilters = [...prev, newFilter];
      localStorage.setItem('saved-filters', JSON.stringify(newFilters));
      return newFilters;
    });
  }, []);

  // Remover filtro salvo
  const removeFilter = useCallback((id: string) => {
    setSavedFilters(prev => {
      const newFilters = prev.filter(filter => filter.id !== id);
      localStorage.setItem('saved-filters', JSON.stringify(newFilters));
      return newFilters;
    });
  }, []);

  return {
    savedFilters,
    saveFilter,
    removeFilter
  };
}

// Funções de API (simuladas)
async function performSearch(filters: SearchFilters, page: number, limit: number): Promise<SearchResponse> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Dados mockados para demonstração
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Lasanha de Berinjela',
      description: 'Uma deliciosa lasanha vegetariana com berinjela e queijo',
      image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=delicious+eggplant+lasagna+with+cheese+and+herbs&image_size=landscape_4_3',
      prep_time: 30,
      cook_time: 45,
      difficulty: 'medium',
      rating: 4.5,
      category: 'Pratos Principais',
      tags: ['vegetariano', 'italiano', 'queijo'],
      ingredients: ['berinjela', 'queijo', 'molho de tomate', 'manjericão'],
      servings: 6,
      author: {
        id: 'user1',
        name: 'Chef Maria',
        avatar_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional+female+chef+avatar&image_size=square'
      },
      relevanceScore: 0.95
    },
    {
      id: '2',
      title: 'Risotto de Cogumelos',
      description: 'Cremoso risotto com mix de cogumelos frescos',
      image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=creamy+mushroom+risotto+with+fresh+herbs&image_size=landscape_4_3',
      prep_time: 15,
      cook_time: 25,
      difficulty: 'medium',
      rating: 4.7,
      category: 'Pratos Principais',
      tags: ['vegetariano', 'italiano', 'cogumelos'],
      ingredients: ['arroz arbóreo', 'cogumelos', 'vinho branco', 'parmesão'],
      servings: 4,
      author: {
        id: 'user2',
        name: 'Chef João',
        avatar_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional+male+chef+avatar&image_size=square'
      },
      relevanceScore: 0.88
    }
  ];

  // Filtrar resultados baseado nos filtros
  let filteredResults = mockResults;
  
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filteredResults = filteredResults.filter(recipe => 
      recipe.title.toLowerCase().includes(query) ||
      recipe.description.toLowerCase().includes(query) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query))
    );
  }

  if (filters.difficulty) {
    filteredResults = filteredResults.filter(recipe => recipe.difficulty === filters.difficulty);
  }

  if (filters.maxPrepTime) {
    filteredResults = filteredResults.filter(recipe => recipe.prep_time <= filters.maxPrepTime!);
  }

  if (filters.ingredients?.length) {
    filteredResults = filteredResults.filter(recipe => 
      filters.ingredients!.some(ingredient => 
        recipe.ingredients.some(recipeIngredient => 
          recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
        )
      )
    );
  }

  // Paginação
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  return {
    results: paginatedResults,
    total: filteredResults.length,
    page,
    totalPages: Math.ceil(filteredResults.length / limit),
    suggestions: ['lasanha', 'risotto', 'vegetariano', 'italiano'],
    filters: {
      categories: [
        { id: '1', name: 'Pratos Principais', count: 15 },
        { id: '2', name: 'Sobremesas', count: 8 },
        { id: '3', name: 'Entradas', count: 12 }
      ],
      difficulties: [
        { value: 'easy', count: 10 },
        { value: 'medium', count: 18 },
        { value: 'hard', count: 5 }
      ],
      cuisines: [
        { name: 'Italiana', count: 12 },
        { name: 'Brasileira', count: 20 },
        { name: 'Francesa', count: 8 }
      ],
      tags: [
        { name: 'vegetariano', count: 15 },
        { name: 'vegano', count: 8 },
        { name: 'sem glúten', count: 6 }
      ],
      prepTimeRanges: [
        { min: 0, max: 15, count: 8 },
        { min: 16, max: 30, count: 12 },
        { min: 31, max: 60, count: 10 }
      ]
    }
  };
}

async function getAutocompleteSuggestions(query: string, types: AutocompleteItem['type'][]): Promise<AutocompleteItem[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const mockSuggestions: AutocompleteItem[] = [
    { id: '1', text: 'Lasanha de Berinjela', type: 'recipe', count: 1 },
    { id: '2', text: 'berinjela', type: 'ingredient', count: 15 },
    { id: '3', text: 'vegetariano', type: 'tag', count: 25 },
    { id: '4', text: 'Pratos Principais', type: 'category', count: 50 },
    { id: '5', text: 'Italiana', type: 'cuisine', count: 30 }
  ];
  
  return mockSuggestions
    .filter(item => 
      types.includes(item.type) && 
      item.text.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10);
}

async function getPopularIngredients(limit: number): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const popular = [
    'tomate', 'cebola', 'alho', 'azeite', 'sal', 'pimenta',
    'queijo', 'frango', 'carne', 'peixe', 'arroz', 'feijão',
    'batata', 'cenoura', 'brócolis', 'manjericão', 'orégano',
    'limão', 'ovos', 'farinha'
  ];
  
  return popular.slice(0, limit);
}