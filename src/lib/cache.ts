import { QueryClient } from '@tanstack/react-query';

// Configuração do cache inteligente
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos por padrão
      staleTime: 5 * 60 * 1000,
      // Manter dados em cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry automático em caso de erro
      retry: 2,
      // Refetch quando a janela ganha foco
      refetchOnWindowFocus: false,
      // Refetch quando reconecta à internet
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Chaves de cache organizadas
export const cacheKeys = {
  recipes: {
    all: ['recipes'] as const,
    lists: () => [...cacheKeys.recipes.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...cacheKeys.recipes.lists(), filters] as const,
    details: () => [...cacheKeys.recipes.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.recipes.details(), id] as const,
    stats: (id: string) => [...cacheKeys.recipes.all, 'stats', id] as const,
    search: (query: string, filters: Record<string, unknown>) => 
      [...cacheKeys.recipes.all, 'search', query, filters] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...cacheKeys.categories.all, 'list'] as const,
  },
  interactions: {
    all: ['interactions'] as const,
    user: (userId: string) => [...cacheKeys.interactions.all, 'user', userId] as const,
    recipe: (recipeId: string) => [...cacheKeys.interactions.all, 'recipe', recipeId] as const,
  },
  user: {
    all: ['user'] as const,
    profile: (id: string) => [...cacheKeys.user.all, 'profile', id] as const,
    preferences: (id: string) => [...cacheKeys.user.all, 'preferences', id] as const,
  },
  recommendations: {
    all: ['recommendations'] as const,
    personalized: (userId: string, filters?: Record<string, unknown>) => 
      [...cacheKeys.recommendations.all, 'personalized', userId, filters] as const,
    similar: (recipeId: string) => 
      [...cacheKeys.recommendations.all, 'similar', recipeId] as const,
    trending: () => 
      [...cacheKeys.recommendations.all, 'trending'] as const,
    preferences: (preferences: Record<string, unknown>) => 
      [...cacheKeys.recommendations.all, 'preferences', preferences] as const,
  },
  search: {
    all: ['search'] as const,
    query: (filters: Record<string, unknown>, page: number, limit: number) => 
      [...cacheKeys.search.all, 'query', filters, page, limit] as const,
    autocomplete: (query: string, types: string[]) => 
      [...cacheKeys.search.all, 'autocomplete', query, types] as const,
    popularIngredients: (limit: number) => 
      [...cacheKeys.search.all, 'popular-ingredients', limit] as const,
    filters: () => 
      [...cacheKeys.search.all, 'filters'] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    metrics: () => [...cacheKeys.analytics.all, 'metrics'] as const,
    events: () => [...cacheKeys.analytics.all, 'events'] as const,
    dashboard: () => [...cacheKeys.analytics.all, 'dashboard'] as const,
    reports: () => [...cacheKeys.analytics.all, 'reports'] as const,
  },
} as const;

// Configurações de cache específicas por tipo de dados
export const cacheConfig = {
  recipes: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },
  categories: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  interactions: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
  user: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  recommendations: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },
  search: {
    // Resultados de busca ficam em cache por pouco tempo
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
  autocomplete: {
    // Autocomplete tem cache muito rápido
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
  popularIngredients: {
    // Ingredientes populares mudam pouco
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  analytics: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  analyticsEvents: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 30 * 60 * 1000, // 30 minutos
  },
  analyticsDashboard: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
  },
};

// Funções utilitárias para invalidação de cache
export const cacheUtils = {
  // Invalidar todas as receitas
  invalidateRecipes: () => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.recipes.all });
  },
  
  // Invalidar receita específica
  invalidateRecipe: (id: string) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.recipes.detail(id) });
    queryClient.invalidateQueries({ queryKey: cacheKeys.recipes.lists() });
  },
  
  // Invalidar interações de uma receita
  invalidateRecipeInteractions: (recipeId: string) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.interactions.recipe(recipeId) });
    queryClient.invalidateQueries({ queryKey: cacheKeys.recipes.stats(recipeId) });
  },
  
  // Invalidar dados do usuário
  invalidateUser: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.user.profile(userId) });
    queryClient.invalidateQueries({ queryKey: cacheKeys.interactions.user(userId) });
    queryClient.invalidateQueries({ queryKey: cacheKeys.recommendations.personalized(userId) });
  },
  
  // Limpar cache específico
  removeFromCache: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },
  
  // Pré-carregar dados
  prefetchRecipe: async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: cacheKeys.recipes.detail(id),
      queryFn: () => fetch(`/api/recipes/${id}`).then(res => res.json()),
      ...cacheConfig.recipes,
    });
  },
  
  // Atualizar dados no cache sem refetch
  updateRecipeInCache: (id: string, updater: (oldData: unknown) => unknown) => {
    queryClient.setQueryData(cacheKeys.recipes.detail(id), updater);
    // Também atualizar nas listas
    queryClient.setQueriesData(
      { queryKey: cacheKeys.recipes.lists() },
      (oldData: unknown) => {
        const data = oldData as { recipes?: Array<{ id: string; [key: string]: unknown }> };
        if (!data?.recipes) return oldData;
        return {
          ...data,
          recipes: data.recipes.map((recipe) => 
            recipe.id === id ? updater(recipe) : recipe
          ),
        };
      }
    );
  },
};

// Hook para cache persistente no localStorage
export const usePersistentCache = () => {
  const saveToStorage = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`chef_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error);
    }
  };
  
  const loadFromStorage = (key: string, maxAge: number = 30 * 60 * 1000) => {
    try {
      const stored = localStorage.getItem(`chef_cache_${key}`);
      if (!stored) return null;
      
      const { data, timestamp } = JSON.parse(stored);
      const age = Date.now() - timestamp;
      
      if (age > maxAge) {
        localStorage.removeItem(`chef_cache_${key}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Erro ao carregar do localStorage:', error);
      return null;
    }
  };
  
  const clearStorage = (pattern?: string) => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('chef_cache_') && (!pattern || key.includes(pattern))) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  };
  
  return { saveToStorage, loadFromStorage, clearStorage };
};