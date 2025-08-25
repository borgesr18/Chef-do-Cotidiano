import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { validateData } from '@/lib/validations';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-placeholder'
);

// Schema para validação de unsubscribe
const unsubscribeSchema = z.object({
  endpoint: z.string().url('Endpoint deve ser uma URL válida')
});

async function deleteHandler(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    const validation = validateData(unsubscribeSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    const { endpoint } = validation.data;

    // Remover subscription do banco
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Erro ao remover subscription:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removida com sucesso' 
    });
    
  } catch (error) {
    console.error('Erro ao processar unsubscribe:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues.map(e => ({
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
export const DELETE = withRateLimit(deleteHandler, rateLimitConfigs.mutation);