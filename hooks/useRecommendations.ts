'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
// import { useAuth } from '../src/hooks/useAuth'; // Removido - hook não existe
// Definindo o tipo Recipe localmente baseado na interface do cache
interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  [key: string]: unknown;
}



interface UserInteraction {
  id: string;
  recipe_id: string;
  action: 'view' | 'favorite' | 'download' | 'share';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface RecommendationScore {
  recipe: Recipe;
  score: number;
  reasons: string[];
}

interface UserPreferences {
  categories: string[];
  difficulties: string[];
  avgPrepTime: number;
  favoriteIngredients: string[];
}

interface RecipeStats {
  total_views: number;
  total_favorites: number;
  total_downloads: number;
  total_shares: number;
  unique_users: number;
}

interface PopularRecipe extends Recipe {
  stats: {
    view_count: number;
    favorite_count: number;
    popularity_score: number;
  };
}

export function useRecommendations() {
  const user = null; // Usuário não autenticado para esta versão
  const queryClient = useQueryClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('session_id');
      if (stored) return stored;
      const newId = crypto.randomUUID();
      localStorage.setItem('session_id', newId);
      return newId;
    }
    return crypto.randomUUID();
  });

  // Função para fazer requisições à API
  const apiRequest = useCallback(async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }, []);

  // Buscar receitas em tendência
  const { data: trendingRecipes = [], isLoading: loadingTrending } = useQuery({
    queryKey: ['trending-recipes'],
    queryFn: async () => {
      const data = await apiRequest('/api/recipes/stats?type=trending&limit=10');
      return data.recipes || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  // Buscar todas as receitas para recomendações
  const { data: allRecipes = [], isLoading: loadingRecipes } = useQuery({
    queryKey: ['all-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  // Buscar interações do usuário
  const { data: userInteractions = [], isLoading: loadingInteractions } = useQuery({
    queryKey: ['user-interactions', sessionId],
    queryFn: async () => {
      const data = await apiRequest('/api/interactions?limit=100');
      return data.interactions || [];
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Buscar receitas populares
  const { data: popularRecipes = [], isLoading: loadingPopular } = useQuery({
    queryKey: ['popular-recipes'],
    queryFn: async () => {
      const data = await apiRequest('/api/recipes/stats?type=popular&days=30&limit=20');
      return data.recipes || [];
    },
    staleTime: 1000 * 60 * 15, // 15 minutos
  });

  // Calcular preferências do usuário
  const userPreferences = useMemo(() => {
    if (!userInteractions.length) return null;

    const categories = userInteractions
      .map((i: any) => {
        const recipe = allRecipes.find(r => r.id === i.recipe_id);
        return recipe?.category;
      })
      .filter(Boolean);

    const difficulties = userInteractions
      .map((i: any) => {
        const recipe = allRecipes.find(r => r.id === i.recipe_id);
        return recipe?.difficulty;
      })
      .filter(Boolean);

    const prepTimes = userInteractions
      .map((i: any) => {
        const recipe = allRecipes.find(r => r.id === i.recipe_id);
        return recipe?.prep_time;
      })
      .filter(Boolean) as number[];

    const avgPrepTime = prepTimes.length > 0 
      ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length 
      : 0;

    const favoriteIngredients = userInteractions
      .flatMap((i: any) => {
        const recipe = allRecipes.find(r => r.id === i.recipe_id);
        return recipe?.ingredients || [];
      })
      .reduce((acc: Record<string, number>, ingredient: string) => {
        acc[ingredient] = (acc[ingredient] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      categories: [...new Set(categories)] as string[],
      difficulties: [...new Set(difficulties)] as string[],
      avgPrepTime,
      favoriteIngredients: Object.keys(favoriteIngredients)
        .sort((a, b) => favoriteIngredients[b] - favoriteIngredients[a])
        .slice(0, 10)
    };
  }, [userInteractions, allRecipes]);

  // Buscar recomendações personalizadas
  const { data: recommendations = [], isLoading: loadingRecommendations } = useQuery({
    queryKey: ['recommendations', sessionId, userPreferences],
    queryFn: async () => {
      if (!allRecipes.length) return [];

      const scoredRecipes: RecommendationScore[] = allRecipes
        .map(recipe => {
          const score = calculateRecommendationScore(recipe, userInteractions, popularRecipes);
          const reasons = generateReasons(recipe, userInteractions, popularRecipes);
          
          return {
            recipe,
            score,
            reasons,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

      return scoredRecipes;
    },
    enabled: !!allRecipes.length,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Mutation para rastrear interações
  const trackInteraction = useMutation({
    mutationFn: async ({
      recipeId,
      action,
      metadata = {}
    }: {
      recipeId: string;
      action: 'view' | 'favorite' | 'download' | 'share';
      metadata?: Record<string, any>;
    }) => {
      return apiRequest('/api/interactions', {
        method: 'POST',
        body: JSON.stringify({
          recipeId,
          action,
          metadata,
          sessionId
        })
      });
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user-interactions'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['popular-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['trending-recipes'] });
    },
  });

  // Obter recomendações por categoria
  const getRecommendationsByCategory = useCallback((category: string, count = 3) => {
    return recommendations
      .filter(rec => rec.recipe.category === category)
      .slice(0, count);
  }, [recommendations]);

  // Obter receitas similares
  const getSimilarRecipes = useCallback((recipeId: string, count = 4) => {
    const targetRecipe = allRecipes.find(r => r.id === recipeId);
    if (!targetRecipe) return [];

    return allRecipes
      .filter(recipe => recipe.id !== recipeId)
      .map(recipe => ({
        recipe,
        score: calculateSimilarityScore(targetRecipe, recipe),
        reasons: [`Receita similar a "${targetRecipe.title}"`],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }, [allRecipes]);

  // Função para remover interação (ex: desfavoritar)
  const removeInteraction = useMutation({
    mutationFn: async ({
      recipeId,
      action
    }: {
      recipeId: string;
      action: 'view' | 'favorite' | 'download' | 'share';
    }) => {
      return apiRequest(`/api/interactions?recipeId=${recipeId}&action=${action}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-interactions'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  // Função para obter estatísticas de uma receita
  const getRecipeStats = useCallback(async (recipeId: string): Promise<RecipeStats | null> => {
    try {
      const data = await apiRequest(`/api/recipes/stats?type=stats&recipeId=${recipeId}`);
      return data.stats || null;
    } catch (error) {
      console.error('Erro ao obter estatísticas da receita:', error);
      return null;
    }
  }, [apiRequest]);

  return {
    // Dados
    recommendations,
    popularRecipes,
    trendingRecipes,
    userInteractions,
    userPreferences,
    
    // Estados de loading
    isLoading: loadingRecommendations || loadingPopular || loadingTrending || loadingInteractions || loadingRecipes,
    
    // Funções de tracking
    trackView: (recipeId: string, metadata?: Record<string, any>) => 
      trackInteraction.mutate({ recipeId, action: 'view', metadata }),
    
    trackFavorite: (recipeId: string, metadata?: Record<string, any>) => 
      trackInteraction.mutate({ recipeId, action: 'favorite', metadata }),
    
    trackDownload: (recipeId: string, metadata?: Record<string, any>) => 
      trackInteraction.mutate({ recipeId, action: 'download', metadata }),
    
    trackShare: (recipeId: string, metadata?: Record<string, any>) => 
      trackInteraction.mutate({ recipeId, action: 'share', metadata }),
    
    // Função para remover interações
    removeFavorite: (recipeId: string) => 
      removeInteraction.mutate({ recipeId, action: 'favorite' }),
    
    // Funções de recomendação
    getRecommendationsByCategory,
    getSimilarRecipes,
    getRecipeStats,
    
    // Estados das mutations
    isTracking: trackInteraction.isPending,
    isRemoving: removeInteraction.isPending,
  };
};

// Função para calcular score de recomendação
function calculateRecommendationScore(
  recipe: Recipe,
  userInteractions: UserInteraction[],
  popularRecipes: Recipe[]
): number {
  let score = 0;

  // Score base pela popularidade
  const popularityRank = popularRecipes.findIndex(p => p.id === recipe.id);
  if (popularityRank !== -1) {
    score += (20 - popularityRank) * 2; // Máximo 38 pontos
  }

  // Score pela avaliação
  const rating = typeof recipe.rating === 'number' ? recipe.rating : 0;
  score += rating * 10; // Máximo 50 pontos

  // Score pelas visualizações
  const views = typeof recipe.views === 'number' ? recipe.views : 0;
  score += Math.min(views / 100, 20); // Máximo 20 pontos

  // Score baseado no histórico do usuário
  const userRecipeIds = userInteractions.map(i => i.recipe_id);
  const userCategories = userInteractions
    .map(i => {
      const interactedRecipe = popularRecipes.find(r => r.id === i.recipe_id);
      return interactedRecipe?.category;
    })
    .filter(Boolean);

  // Bonus se a categoria é preferida pelo usuário
  const categoryCount = userCategories.filter(cat => cat === recipe.category).length;
  score += categoryCount * 5; // 5 pontos por interação na categoria

  // Bonus se o usuário não viu esta receita ainda
  if (!userRecipeIds.includes(recipe.id)) {
    score += 10;
  }

  // Penalty para receitas muito complexas se o usuário prefere receitas simples
  const userDifficulties = userInteractions
    .map(i => {
      const interactedRecipe = popularRecipes.find(r => r.id === i.recipe_id);
      return interactedRecipe?.difficulty;
    })
    .filter(Boolean);
  
  const prefersEasy = userDifficulties.filter(d => d === 'easy').length > 
                     userDifficulties.filter(d => d === 'hard').length;
  
  if (prefersEasy && recipe.difficulty === 'hard') {
    score -= 10;
  }

  // Bonus para receitas recentes
  const createdAt = recipe.created_at ? new Date(recipe.created_at as string) : new Date();
  const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) {
    score += 15; // Bonus para receitas da última semana
  } else if (daysSinceCreated < 30) {
    score += 5; // Bonus menor para receitas do último mês
  }

  return Math.max(0, score);
}

// Função para calcular similaridade entre receitas
function calculateSimilarityScore(recipe1: Recipe, recipe2: Recipe): number {
  let score = 0;

  // Mesma categoria
  if (recipe1.category === recipe2.category) {
    score += 30;
  }

  // Mesma dificuldade
  if (recipe1.difficulty === recipe2.difficulty) {
    score += 20;
  }

  // Tempo de preparo similar
  const prepTime1 = typeof recipe1.prep_time === 'number' ? recipe1.prep_time : 0;
  const prepTime2 = typeof recipe2.prep_time === 'number' ? recipe2.prep_time : 0;
  const timeDiff = Math.abs(prepTime1 - prepTime2);
  if (timeDiff <= 10) {
    score += 15;
  } else if (timeDiff <= 30) {
    score += 5;
  }

  // Tags em comum
  const tags1 = Array.isArray(recipe1.tags) ? recipe1.tags : [];
  const tags2 = Array.isArray(recipe2.tags) ? recipe2.tags : [];
  const commonTags = tags1.filter(tag => tags2.includes(tag));
  score += commonTags.length * 10;

  // Ingredientes em comum
  const ingredients1 = Array.isArray(recipe1.ingredients) ? recipe1.ingredients : [];
  const ingredients2 = Array.isArray(recipe2.ingredients) ? recipe2.ingredients : [];
  const commonIngredients = ingredients1.filter(ing => 
    ingredients2.some(ing2 => 
      String(ing).toLowerCase().includes(String(ing2).toLowerCase()) || 
      String(ing2).toLowerCase().includes(String(ing).toLowerCase())
    )
  );
  score += commonIngredients.length * 5;

  return score;
}

// Função para gerar razões da recomendação
function generateReasons(
  recipe: Recipe,
  userInteractions: UserInteraction[],
  popularRecipes: Recipe[]
): string[] {
  const reasons: string[] = [];

  // Verificar se é popular
  const popularityRank = popularRecipes.findIndex(p => p.id === recipe.id);
  if (popularityRank !== -1 && popularityRank < 5) {
    reasons.push('Receita muito popular');
  }

  // Verificar categoria preferida
  const userCategories = userInteractions
    .map(i => {
      const interactedRecipe = popularRecipes.find(r => r.id === i.recipe_id);
      return interactedRecipe?.category;
    })
    .filter(Boolean);
  
  const categoryCount = userCategories.filter(cat => cat === recipe.category).length;
  if (categoryCount > 2) {
    reasons.push(`Você gosta de receitas de ${recipe.category}`);
  }

  // Verificar avaliação alta
  const rating = typeof recipe.rating === 'number' ? recipe.rating : 0;
  if (rating >= 4.5) {
    reasons.push('Receita muito bem avaliada');
  }

  // Verificar se é nova
  const createdAt = recipe.created_at ? new Date(recipe.created_at as string) : new Date();
  const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) {
    reasons.push('Receita nova');
  }

  // Verificar tempo de preparo
  const prepTime = typeof recipe.prep_time === 'number' ? recipe.prep_time : 0;
  if (prepTime <= 30) {
    reasons.push('Rápida de preparar');
  }

  return reasons;
}