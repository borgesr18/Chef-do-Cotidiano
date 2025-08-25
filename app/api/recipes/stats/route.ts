import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { paginationSchema, validateData } from '@/lib/validations';

// Schema para parâmetros de estatísticas específicos
const statsQuerySchema = z.object({
  recipe_id: z.string().uuid('ID da receita deve ser um UUID válido').optional(),
  period: z.enum(['day', 'week', 'month', 'year'], {
    errorMap: () => ({ message: 'Período deve ser: day, week, month ou year' })
  }).default('week'),
  action: z.enum(['view', 'like', 'favorite', 'share', 'download'], {
    errorMap: () => ({ message: 'Ação deve ser: view, like, favorite, share ou download' })
  }).optional()
}).merge(paginationSchema);

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obter estatísticas de receitas
async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validar parâmetros da query
    const queryParams = {
      recipe_id: searchParams.get('recipe_id'),
      period: searchParams.get('period'),
      action: searchParams.get('action'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort_by: searchParams.get('sort_by'),
      order: searchParams.get('order')
    };
    
    const validation = validateData(statsQuerySchema, queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos', 
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const { recipe_id, period = 'week', action, page = 1, limit = 20, sort_by, order } = validation.data;
    
    // Calcular offset para paginação
    const offset = (page - 1) * limit;
    
    // Calcular data de início baseada no período
    const periodDays = {
      day: 1,
      week: 7,
      month: 30,
      year: 365
    };
    const startDate = new Date(Date.now() - periodDays[period] * 24 * 60 * 60 * 1000);
    
    // Estatísticas de uma receita específica
    if (recipe_id) {
      let query = supabase
        .from('interactions')
        .select('action, created_at, user_id')
        .eq('recipe_id', recipe_id)
        .gte('created_at', startDate.toISOString());
        
      if (action) {
        query = query.eq('action', action);
      }
      
      const { data: stats, error } = await query
        .order('created_at', { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return NextResponse.json(
          { error: 'Erro interno do servidor' },
          { status: 500 }
        );
      }

      // Agrupar por ação
      const grouped = stats.reduce((acc: Record<string, number>, stat) => {
        acc[stat.action] = (acc[stat.action] || 0) + 1;
        return acc;
      }, {});

      return NextResponse.json({
        recipe_id,
        period,
        action,
        stats: grouped,
        total: stats.length,
        page,
        limit
      });
    }
    
    // Estatísticas gerais - receitas mais populares
    let query = supabase
      .from('interactions')
      .select(`
        recipe_id,
        action,
        created_at,
        recipes!inner(
          id,
          title,
          category,
          difficulty,
          prep_time,
          cook_time,
          servings,
          rating,
          created_at
        )
      `)
      .gte('created_at', startDate.toISOString());

    if (action) {
      query = query.eq('action', action);
    }

    const { data: interactions, error } = await query
      .order('created_at', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    // Agrupar por receita e contar interações
    const recipeStats = interactions.reduce((acc: Record<string, any>, interaction) => {
      const recipeId = interaction.recipe_id;
      if (!acc[recipeId]) {
        acc[recipeId] = {
          recipe: interaction.recipes,
          stats: {},
          total: 0
        };
      }
      
      acc[recipeId].stats[interaction.action] = (acc[recipeId].stats[interaction.action] || 0) + 1;
      acc[recipeId].total += 1;
      
      return acc;
    }, {});

    // Converter para array e ordenar
    const sortedRecipes = Object.values(recipeStats)
      .sort((a, b) => sort_by === 'total' ? b.total - a.total : 0)
      .slice(0, limit);

    return NextResponse.json({
      period,
      action,
      recipes: sortedRecipes,
      total: sortedRecipes.length,
      page,
      limit
    });
    
  } catch (error) {
    console.error('Erro na API de estatísticas:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Aplicar rate limiting ao handler
export const GET = withRateLimit(getHandler, rateLimitConfigs.public);