'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { cacheKeys, cacheConfig } from '../lib/cache';
import { useAuth } from './useAuth';
import { Recipe } from '../types';

interface UserInteraction {
  id: string;
  user_id: string;
  recipe_id: string;
  interaction_type: 'view' | 'like' | 'save' | 'share' | 'cook';
  created_at: string;
  recipe?: Recipe;
}

interface RecommendationScore {
  recipe_id: string;
  score: number;
  reasons: string[];
  recipe?: Recipe;
}

interface RecommendationFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  cookingTime?: number;
  excludeViewed?: boolean;
  limit?: number;
  [key: string]: unknown;
}

// Hook para buscar recomendações personalizadas
export function useRecommendations(filters: RecommendationFilters = {}) {
  const { user } = useAuth();
 const {
     // category,
     // difficulty,
     // cookingTime,
     // excludeViewed = true,
     limit = 10
   } = filters;

  return useQuery({
    queryKey: cacheKeys.recommendations.personalized(user?.id || 'anonymous', filters),
    queryFn: async (): Promise<Recipe[]> => {
      if (!user) {
        // Para usuários não logados, retornar receitas populares
        return getPopularRecipes(limit);
      }

      // Buscar interações do usuário
      const interactions = await getUserInteractions(user.id);
      
      // Calcular scores de recomendação
      const scores = await calculateRecommendationScores(user.id, interactions, filters);
      
      // Buscar receitas com base nos scores
      const recommendedRecipes = await getRecipesByScores(scores, limit);
      
      return recommendedRecipes;
    },
    staleTime: cacheConfig.recommendations.staleTime,
    gcTime: cacheConfig.recommendations.gcTime,
    enabled: true
  });
}

// Hook para buscar receitas similares
export function useSimilarRecipes(recipeId: string, limit: number = 6) {
  return useQuery({
    queryKey: cacheKeys.recommendations.similar(recipeId),
    queryFn: async (): Promise<Recipe[]> => {
      const { data: recipe } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (!recipe) return [];

      // Buscar receitas similares por categoria, ingredientes e tags
      const { data: similarRecipes } = await supabase
        .from('recipes')
        .select('*')
        .neq('id', recipeId)
        .or(`category.eq.${recipe.category},tags.cs.{${recipe.tags?.join(',') || ''}}`)
        .limit(limit);

      return similarRecipes || [];
    },
    staleTime: cacheConfig.recommendations.staleTime,
    gcTime: cacheConfig.recommendations.gcTime,
    enabled: !!recipeId
  });
}

// Hook para buscar receitas trending
export function useTrendingRecipes(limit: number = 8) {
  return useQuery({
    queryKey: cacheKeys.recommendations.trending(),
    queryFn: async (): Promise<Recipe[]> => {
      // Buscar receitas com mais interações nos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: trendingData } = await supabase
        .from('user_interactions')
        .select(`
          recipe_id,
          recipes!inner(*)
        `)
        .gte('created_at', sevenDaysAgo.toISOString())
        .in('interaction_type', ['view', 'like', 'save'])
        .order('created_at', { ascending: false });

      if (!trendingData) return [];

      // Contar interações por receita
      const recipeCounts = trendingData.reduce((acc, item) => {
        const recipeId = item.recipe_id;
        acc[recipeId] = (acc[recipeId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Ordenar por popularidade e pegar as top receitas
      const sortedRecipes: Recipe[] = (Object.entries(recipeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([recipeId]) => {
          const recipeData = trendingData.find(item => item.recipe_id === recipeId);
          return recipeData?.recipes;
        })
        .filter(recipe => recipe !== undefined && recipe !== null) as unknown) as Recipe[];

      return sortedRecipes;
    },
    staleTime: cacheConfig.recommendations.staleTime,
    gcTime: cacheConfig.recommendations.gcTime
  });
}

// Hook para registrar interação do usuário
export function useTrackInteraction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      recipeId,
      interactionType,
      metadata
    }: {
      recipeId: string;
      interactionType: 'view' | 'like' | 'save' | 'share' | 'cook';
      metadata?: Record<string, unknown>;
    }) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          interaction_type: interactionType,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar caches de recomendações
      queryClient.invalidateQueries({ 
        queryKey: cacheKeys.recommendations.personalized(user?.id || 'anonymous') 
      });
      queryClient.invalidateQueries({ 
        queryKey: cacheKeys.recommendations.trending() 
      });
    }
  });
}

// Hook para buscar receitas baseadas em preferências
export function usePreferenceBasedRecipes(preferences: {
  categories: string[];
  dietaryRestrictions: string[];
  cookingTime: number;
  difficulty: string[];
}, limit: number = 12) {
  return useQuery({
    queryKey: cacheKeys.recommendations.preferences(preferences),
    queryFn: async (): Promise<Recipe[]> => {
      let query = supabase.from('recipes').select('*');

      // Filtrar por categorias
      if (preferences.categories.length > 0) {
        query = query.in('category', preferences.categories);
      }

      // Filtrar por tempo de preparo
      if (preferences.cookingTime > 0) {
        query = query.lte('prep_time', preferences.cookingTime);
      }

      // Filtrar por dificuldade
      if (preferences.difficulty.length > 0) {
        query = query.in('difficulty', preferences.difficulty);
      }

      // Filtrar por restrições dietéticas
      if (preferences.dietaryRestrictions.length > 0) {
        const restrictions = preferences.dietaryRestrictions.map(r => `"${r}"`).join(',');
        query = query.contains('tags', `[${restrictions}]`);
      }

      const { data } = await query.limit(limit);
      return data || [];
    },
    staleTime: cacheConfig.recommendations.staleTime,
    gcTime: cacheConfig.recommendations.gcTime,
    enabled: preferences.categories.length > 0 || 
             preferences.difficulty.length > 0 || 
             preferences.dietaryRestrictions.length > 0
  });
}

// Funções auxiliares
async function getUserInteractions(userId: string): Promise<UserInteraction[]> {
  const { data } = await supabase
    .from('user_interactions')
    .select(`
      *,
      recipes!inner(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  return data || [];
}

async function calculateRecommendationScores(
  userId: string,
  interactions: UserInteraction[],
  filters: RecommendationFilters
): Promise<RecommendationScore[]> {
  // Analisar padrões do usuário
  const userPatterns = analyzeUserPatterns(interactions);
  
  // Buscar todas as receitas disponíveis
  let query = supabase.from('recipes').select('*');
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  
  if (filters.cookingTime) {
    query = query.lte('prep_time', filters.cookingTime);
  }
  
  const { data: allRecipes } = await query;
  
  if (!allRecipes) return [];
  
  // Calcular score para cada receita
  const scores: RecommendationScore[] = allRecipes.map(recipe => {
    let score = 0;
    const reasons: string[] = [];
    
    // Score baseado em categoria preferida
    if (userPatterns.favoriteCategories.includes(recipe.category)) {
      score += 30;
      reasons.push('Categoria favorita');
    }
    
    // Score baseado em dificuldade preferida
    if (userPatterns.favoriteDifficulty === recipe.difficulty) {
      score += 20;
      reasons.push('Nível de dificuldade preferido');
    }
    
    // Score baseado em tempo de preparo
    if (recipe.prep_time <= userPatterns.averagePrepTime * 1.2) {
      score += 15;
      reasons.push('Tempo de preparo adequado');
    }
    
    // Score baseado em ingredientes similares
    const commonIngredients = recipe.ingredients?.filter((ingredient: string) => 
      userPatterns.favoriteIngredients.includes(ingredient.toLowerCase())
    ) || [];
    
    score += commonIngredients.length * 5;
    if (commonIngredients.length > 0) {
      reasons.push(`${commonIngredients.length} ingredientes familiares`);
    }
    
    // Penalizar receitas já visualizadas recentemente
    if (filters.excludeViewed) {
      const recentlyViewed = interactions
        .filter(i => i.interaction_type === 'view')
        .slice(0, 20)
        .some(i => i.recipe_id === recipe.id);
      
      if (recentlyViewed) {
        score -= 50;
        reasons.push('Visualizada recentemente');
      }
    }
    
    // Bonus para receitas populares
    if (recipe.likes_count && recipe.likes_count > 10) {
      score += Math.min(recipe.likes_count / 2, 25);
      reasons.push('Popular entre usuários');
    }
    
    return {
      recipe_id: recipe.id,
      score: Math.max(0, score),
      reasons,
      recipe
    };
  });
  
  return scores.sort((a, b) => b.score - a.score);
}

function analyzeUserPatterns(interactions: UserInteraction[]) {
  const categories = interactions.map(i => i.recipe?.category).filter(Boolean);
  const difficulties = interactions.map(i => i.recipe?.difficulty).filter(Boolean);
  const prepTimes = interactions.map(i => i.recipe?.prep_time).filter(Boolean) as number[];
  const ingredients = interactions.flatMap(i => i.recipe?.ingredients || []);
  
  return {
    favoriteCategories: getMostFrequent(categories, 3),
    favoriteDifficulty: getMostFrequent(difficulties, 1)[0] || 'medium',
    averagePrepTime: prepTimes.length > 0 ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length : 30,
    favoriteIngredients: getMostFrequent(ingredients.map(i => i.toLowerCase()), 10)
  };
}

function getMostFrequent<T>(arr: T[], limit: number): T[] {
  const frequency = arr.reduce((acc, item) => {
    acc[item as string] = (acc[item as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item as T);
}

async function getRecipesByScores(scores: RecommendationScore[], limit: number): Promise<Recipe[]> {
  return scores
    .slice(0, limit)
    .map(score => score.recipe)
    .filter(Boolean) as Recipe[];
}

async function getPopularRecipes(limit: number): Promise<Recipe[]> {
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .order('likes_count', { ascending: false })
    .limit(limit);
    
  return data || [];
}