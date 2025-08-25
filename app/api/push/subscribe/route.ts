import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { pushSubscriptionSchema, validateData } from '@/lib/validations';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados da subscription
    const validation = validateData(pushSubscriptionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados de subscription inválidos', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    const subscription = validation.data;

    // Obter informações do usuário (se autenticado)
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Salvar subscription no banco
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint'
      });

    if (error) {
      console.error('Erro ao salvar subscription:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription registrada com sucesso' 
    });
    
  } catch (error) {
    console.error('Erro ao processar subscription:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Aplicar rate limiting ao handler
export const POST = withRateLimit(postHandler, rateLimitConfigs.mutation);