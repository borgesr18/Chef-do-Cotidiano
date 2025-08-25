import { useQuery, useMutation } from '@tanstack/react-query';
import { cacheKeys, cacheConfig, cacheUtils } from '../lib/cache';
import { supabase } from '../lib/supabase';
import { Recipe, RecipeFilters, RecipeStats } from '../types';

// Hook para buscar lista de receitas com filtros
export const useRecipes = (filters: RecipeFilters = {}) => {
  return useQuery({
    queryKey: cacheKeys.recipes.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('recipes')
        .select(`
          *,
          categories(*),
          profiles(name, avatar_url)
        `);

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.prep_time_max) {
        query = query.lte('prep_time', filters.prep_time_max);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.ingredients) {
        query = query.contains('ingredients', filters.ingredients);
      }

      // Ordenação
      const orderBy = filters.sort_by || 'created_at';
      const order = filters.order || 'desc';
      query = query.order(orderBy, { ascending: order === 'asc' });

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        recipes: data || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > offset + limit
      };
    },
    ...cacheConfig.recipes,
  });
};

// Hook para buscar receita específica
export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: cacheKeys.recipes.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          categories(*),
          profiles(name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    ...cacheConfig.recipes,
  });
};

// Hook para buscar estatísticas de uma receita
export const useRecipeStats = (id: string) => {
  return useQuery({
    queryKey: cacheKeys.recipes.stats(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('action')
        .eq('recipe_id', id);

      if (error) throw error;

      const stats: RecipeStats = {
        total_recipes: 0,
        total_views: 0,
        total_likes: 0,
        popular_categories: [],
        views: 0,
        likes: 0,
        saves: 0,
        shares: 0
      };

      data?.forEach(interaction => {
        if (interaction.action in stats) {
          stats[interaction.action as keyof RecipeStats]++;
        }
      });

      return stats;
    },
    enabled: !!id,
    ...cacheConfig.interactions,
  });
};

// Hook para buscar receitas recomendadas
export const useRecommendedRecipes = (userId?: string, limit: number = 6) => {
  return useQuery({
    queryKey: cacheKeys.recommendations.personalized(userId || 'anonymous'),
    queryFn: async () => {
      // Se não há usuário, retorna receitas populares
      if (!userId) {
        const { data, error } = await supabase
          .from('recipes')
          .select(`
            *,
            categories(*),
            profiles(name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      }

      // Buscar interações do usuário para gerar recomendações
      const { data: userInteractions, error: interactionsError } = await supabase
        .from('interactions')
        .select('recipe_id, action')
        .eq('user_id', userId)
        .in('action', ['like', 'save'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (interactionsError) throw interactionsError;

      const likedRecipeIds = userInteractions
        ?.filter(i => i.action === 'like')
        .map(i => i.recipe_id) || [];

      if (likedRecipeIds.length === 0) {
        // Se não há interações, retorna receitas populares
        const { data, error } = await supabase
          .from('recipes')
          .select(`
            *,
            categories(*),
            profiles(name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      }

      // Buscar categorias das receitas curtidas
      const { data: likedRecipes, error: recipesError } = await supabase
        .from('recipes')
        .select('category_id')
        .in('id', likedRecipeIds);

      if (recipesError) throw recipesError;

      const preferredCategories = [...new Set(
        likedRecipes?.map(r => r.category_id).filter(Boolean) || []
      )];

      // Buscar receitas similares
      let query = supabase
        .from('recipes')
        .select(`
          *,
          categories(*),
          profiles(name, avatar_url)
        `)
        .not('id', 'in', `(${likedRecipeIds.join(',')})`); // Excluir receitas já curtidas

      if (preferredCategories.length > 0) {
        query = query.in('category_id', preferredCategories);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    ...cacheConfig.recipes,
  });
};

// Hook para buscar receitas com busca avançada
export const useSearchRecipes = (query: string, filters: RecipeFilters = {}) => {
  return useQuery({
    queryKey: cacheKeys.recipes.search(query, filters),
    queryFn: async () => {
      if (!query.trim()) return { recipes: [], total: 0 };

      let supabaseQuery = supabase
        .from('recipes')
        .select(`
          *,
          categories(*),
          profiles(name, avatar_url)
        `, { count: 'exact' });

      // Busca por texto
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,ingredients.cs.{"${query}"}`
      );

      // Aplicar filtros adicionais
      if (filters.category) {
        supabaseQuery = supabaseQuery.eq('category_id', filters.category);
      }
      if (filters.difficulty) {
        supabaseQuery = supabaseQuery.eq('difficulty', filters.difficulty);
      }
      if (filters.prep_time_max) {
        supabaseQuery = supabaseQuery.lte('prep_time', filters.prep_time_max);
      }

      const { data, error, count } = await supabaseQuery
        .order('created_at', { ascending: false })
        .limit(filters.limit || 20);

      if (error) throw error;

      return {
        recipes: data || [],
        total: count || 0
      };
    },
    enabled: !!query.trim(),
    ...cacheConfig.search,
  });
};

// Mutation para criar receita
export const useCreateRecipe = () => {

  return useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('recipes')
        .insert(recipe)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar cache de listas de receitas
      cacheUtils.invalidateRecipes();
    },
  });
};

// Mutation para atualizar receita
export const useUpdateRecipe = () => {

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Recipe> & { id: string }) => {
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Atualizar cache específico da receita
      cacheUtils.updateRecipeInCache(data.id, () => data);
    },
  });
};

// Mutation para deletar receita
export const useDeleteRecipe = () => {

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      // Remover do cache e invalidar listas
      cacheUtils.removeFromCache(cacheKeys.recipes.detail(id));
      cacheUtils.invalidateRecipes();
    },
  });
};