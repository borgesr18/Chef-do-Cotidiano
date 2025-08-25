import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { validateData } from '@/lib/validations';

// Configurar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Usando schemas centralizados de validações

// Função para obter ou gerar session ID
function getSessionId(request: NextRequest, providedSessionId?: string): string {
  if (providedSessionId) {
    return providedSessionId;
  }
  
  // Tentar obter do cookie
  const sessionCookie = request.cookies.get('session_id');
  if (sessionCookie?.value) {
    return sessionCookie.value;
  }
  
  // Gerar novo session ID
  return uuidv4();
}

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// POST - Registrar nova interação
async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    const interactionSchema = z.object({
      recipe_id: z.string().uuid('ID da receita inválido'),
      action: z.enum(['view', 'like', 'favorite', 'share', 'download']),
      metadata: z.record(z.any()).optional()
    });
    const validation = validateData(interactionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const { recipe_id, action, metadata = {} } = validation.data;
    
    // Obter usuário atual (se autenticado)
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Gerar session ID
    const sessionId = getSessionId(request);

    // Preparar dados da interação
    const interactionData = {
      recipe_id,
      user_id: userId,
      session_id: sessionId,
      action,
      metadata: {
        ...metadata,
        ip: getClientIP(request),
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      }
    };
    
    // Verificar se a receita existe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipe_id)
      .single();
    
    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      );
    }
    
    // Para ações de 'favorite', verificar se já existe
    if (action === 'favorite') {
      const { data: existingFavorite } = await supabase
        .from('interactions')
        .select('id')
        .eq('recipe_id', recipe_id)
        .eq('action', 'favorite')
        .eq(userId ? 'user_id' : 'session_id', userId || sessionId)
        .single();
      
      if (existingFavorite) {
        return NextResponse.json(
          { message: 'Receita já está nos favoritos' },
          { status: 200 }
        );
      }
    }
    
    // Inserir interação
    const { data: interaction, error: insertError } = await supabase
      .from('interactions')
      .insert(interactionData)
      .select()
      .single();
    
    if (insertError) {
      console.error('Erro ao inserir interação:', insertError);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }
    
    // Configurar cookie de sessão se necessário
    const response = NextResponse.json({
      success: true,
      interaction: {
        id: interaction.id,
        action: interaction.action,
        timestamp: interaction.created_at
      }
    });
    
    if (!request.cookies.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 // 1 ano
      });
    }
    
    return response;
    
  } catch (error) {
    console.error('Erro na API de interações:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
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

// GET - Buscar interações
async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validar parâmetros de query
    const queryParams = {
      recipe_id: searchParams.get('recipe_id'),
      action: searchParams.get('action'),
      query: searchParams.get('query'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort_by: searchParams.get('sort_by'),
      order: searchParams.get('order')
    };
    
    // Schema específico para parâmetros de query de interações
    const interactionQuerySchema = z.object({
      recipe_id: z.string().uuid('ID da receita deve ser um UUID válido').optional(),
      action: z.enum(['view', 'like', 'favorite', 'share', 'download'], {
        errorMap: () => ({ message: 'Ação inválida' })
      }).optional(),
      query: z.string().min(1, 'Termo de busca é obrigatório').max(100, 'Termo de busca muito longo').optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(20),
      sort_by: z.enum(['created_at', 'action', 'recipe_id']).default('created_at'),
      order: z.enum(['asc', 'desc']).default('desc')
    });
    
    const validation = validateData(interactionQuerySchema, queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos', 
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    const { recipe_id, action, query: searchQuery, page = 1, limit = 20, sort_by, order } = validation.data;
    
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    // Calcular offset para paginação
    const offset = (page - 1) * limit;
    
    // Construir query base
    let query = supabase
      .from('interactions')
      .select(`
        id,
        recipe_id,
        action,
        created_at,
        metadata,
        recipes(
          id,
          title,
          category,
          image_url
        )
      `);
    
    // Aplicar filtros
    if (recipe_id) {
      query = query.eq('recipe_id', recipe_id);
    }
    
    if (action) {
      query = query.eq('action', action);
    }
    
    // Filtrar por usuário se autenticado
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      // Para usuários não autenticados, usar session ID
      const sessionId = getSessionId(request);
      query = query.eq('session_id', sessionId);
    }
    
    // Aplicar paginação e ordenação
    const { data: interactions, error } = await query
      .order('created_at', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Erro ao buscar interações:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      interactions: interactions || [],
      pagination: {
        page,
        limit,
        total: interactions?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Erro na API de interações (GET):', error);
    
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

// DELETE - Remover interação (ex: desfavoritar)
async function deleteHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validar parâmetros de query
    const queryParams = {
      recipe_id: searchParams.get('recipe_id') || searchParams.get('recipeId'),
      action: searchParams.get('action')
    };
    
    const deleteSchema = z.object({
      recipe_id: z.string().uuid('ID da receita deve ser um UUID válido'),
      action: z.enum(['view', 'like', 'favorite', 'share', 'download'], {
        errorMap: () => ({ message: 'Ação inválida' })
      })
    });
    
    const validation = validateData(deleteSchema, queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos', 
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    const { recipe_id, action } = validation.data;
    
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    // Construir query de deleção
    let deleteQuery = supabase
      .from('interactions')
      .delete()
      .eq('recipe_id', recipe_id)
      .eq('action', action);
    
    if (user) {
      deleteQuery = deleteQuery.eq('user_id', user.id);
    } else {
      const sessionId = getSessionId(request);
      deleteQuery = deleteQuery.eq('session_id', sessionId);
    }
    
    const { error } = await deleteQuery;
    
    if (error) {
      console.error('Erro ao remover interação:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Interação removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro na API de interações (DELETE):', error);
    
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

// Aplicar rate limiting aos handlers
export const POST = withRateLimit(postHandler, rateLimitConfigs.mutation);
export const GET = withRateLimit(getHandler, rateLimitConfigs.public);
export const DELETE = withRateLimit(deleteHandler, rateLimitConfigs.mutation);