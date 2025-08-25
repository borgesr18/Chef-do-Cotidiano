'use client';

import { QueryClient } from '@tanstack/react-query';

// Configuração do QueryClient com cache inteligente
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos para dados gerais
      staleTime: 5 * 60 * 1000,
      // Manter cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry em caso de erro
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch quando a janela ganha foco
      refetchOnWindowFocus: false,
      // Refetch quando reconecta
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Interface para filtros de receitas
interface RecipeFilters {
  category?: string
  difficulty?: string
  cookTime?: number
  [key: string]: unknown
}

// Interface para dados de receita
interface Recipe {
  id: string
  title: string
  description?: string
  image_url?: string
  [key: string]: unknown
}

// Chaves de cache organizadas
export const cacheKeys = {
  recipes: {
    all: ['recipes'] as const,
    lists: () => [...cacheKeys.recipes.all, 'list'] as const,
    list: (filters: RecipeFilters) => [...cacheKeys.recipes.lists(), filters] as const,
    details: () => [...cacheKeys.recipes.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.recipes.details(), id] as const,
    search: (query: string) => [...cacheKeys.recipes.all, 'search', query] as const,
    recommendations: (userId?: string) => [...cacheKeys.recipes.all, 'recommendations', userId] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...cacheKeys.categories.all, 'list'] as const,
    detail: (id: string) => [...cacheKeys.categories.all, 'detail', id] as const,
  },
  user: {
    all: ['user'] as const,
    profile: (id: string) => [...cacheKeys.user.all, 'profile', id] as const,
    favorites: (id: string) => [...cacheKeys.user.all, 'favorites', id] as const,
    history: (id: string) => [...cacheKeys.user.all, 'history', id] as const,
  },
} as const;

// Estratégias de cache específicas
export const cacheStrategies = {
  // Cache longo para dados que mudam raramente
  static: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  },
  // Cache médio para listas de receitas
  recipes: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  },
  // Cache curto para dados do usuário
  user: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
  // Cache muito curto para busca
  search: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
  },
};

// Utilitários para invalidação de cache
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
  
  // Invalidar categorias
  invalidateCategories: () => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.categories.all });
  },
  
  // Invalidar dados do usuário
  invalidateUser: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.user.profile(userId) });
    queryClient.invalidateQueries({ queryKey: cacheKeys.user.favorites(userId) });
    queryClient.invalidateQueries({ queryKey: cacheKeys.user.history(userId) });
  },
  
  // Limpar cache de busca
  clearSearchCache: () => {
    queryClient.removeQueries({ 
      queryKey: cacheKeys.recipes.all,
      predicate: (query) => query.queryKey.includes('search')
    });
  },
  
  // Prefetch de receita
  prefetchRecipe: async (id: string, fetcher: () => Promise<Recipe>) => {
    await queryClient.prefetchQuery({
      queryKey: cacheKeys.recipes.detail(id),
      queryFn: fetcher,
      ...cacheStrategies.recipes,
    });
  },
  
  // Prefetch de categoria
  prefetchCategory: async (id: string, fetcher: () => Promise<unknown>) => {
    await queryClient.prefetchQuery({
      queryKey: cacheKeys.categories.detail(id),
      queryFn: fetcher,
      ...cacheStrategies.static,
    });
  },
  
  // Atualizar cache otimisticamente
  updateRecipeCache: (id: string, updater: (old: Recipe) => Recipe) => {
    queryClient.setQueryData(cacheKeys.recipes.detail(id), updater);
    
    // Atualizar também nas listas
    queryClient.setQueriesData(
      { queryKey: cacheKeys.recipes.lists() },
      (old: { data?: Recipe[] } | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((recipe: Recipe) => 
            recipe.id === id ? updater(recipe) : recipe
          ),
        };
      }
    );
  },
  
  // Gerenciar cache de favoritos
  updateFavoritesCache: (userId: string, recipeId: string, isFavorite: boolean) => {
    queryClient.setQueryData(
      cacheKeys.user.favorites(userId),
      (old: string[] | undefined) => {
        if (!old) return old;
        
        if (isFavorite) {
          return [...(old || []), recipeId];
        } else {
          return (old || []).filter((id: string) => id !== recipeId);
        }
      }
    );
  },
};

// Hook para monitorar status do cache
export function useCacheStatus() {
  const queries = queryClient.getQueryCache().getAll();
  
  const stats = {
    total: queries.length,
    fresh: queries.filter(q => q.state.dataUpdatedAt > Date.now() - 300000).length, // 5 minutos
    stale: queries.filter(q => q.isStale()).length,
    loading: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    error: queries.filter(q => q.state.status === 'error').length,
  };
  
  return stats;
}

// Persistência do cache (opcional)
export const persistCache = {
  save: () => {
    if (typeof window !== 'undefined') {
      const cache = queryClient.getQueryCache().getAll()
        .filter(query => {
          // Salvar apenas queries importantes e não sensíveis
          const key = query.queryKey[0] as string;
          return ['categories', 'recipes'].includes(key) && 
                 !query.queryKey.includes('user') &&
                 query.state.data;
        })
        .map(query => ({
          queryKey: query.queryKey,
          data: query.state.data,
          dataUpdatedAt: query.state.dataUpdatedAt,
        }));
      
      localStorage.setItem('chef-cache', JSON.stringify(cache));
    }
  },
  
  restore: () => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('chef-cache');
        if (cached) {
          const data = JSON.parse(cached);
          data.forEach((item: { queryKey: unknown[]; data: unknown; dataUpdatedAt: number }) => {
            // Restaurar apenas se não estiver muito antigo (1 hora)
            if (Date.now() - item.dataUpdatedAt < 60 * 60 * 1000) {
              queryClient.setQueryData(item.queryKey, item.data);
            }
          });
        }
      } catch (error) {
        console.warn('Erro ao restaurar cache:', error);
        localStorage.removeItem('chef-cache');
      }
    }
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chef-cache');
    }
  },
};