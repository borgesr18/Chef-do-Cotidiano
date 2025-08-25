import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { pushPayloadSchema, validateData } from '@/lib/validations';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-placeholder'
);

// Configurar VAPID keys somente se disponíveis em runtime
const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
if (vapidPublic && vapidPrivate) {
  try {
    webpush.setVapidDetails('mailto:contato@chefdocotidiano.com.br', vapidPublic, vapidPrivate);
  } catch (e) {
    // Ignorar em build/runtime sem chaves válidas para não falhar
    console.warn('VAPID não configurado:', e);
  }
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Schema para validação do request completo
const sendPushSchema = z.object({
  payload: pushPayloadSchema,
  userIds: z.array(z.string().uuid()).optional(),
  sendToAll: z.boolean().default(false),
});

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados do request
    const validation = validateData(sendPushSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    const { payload, userIds, sendToAll } = validation.data;

    // Verificar autenticação (apenas admins podem enviar)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar se é admin (você pode implementar sua lógica de verificação)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas admins podem enviar notificações.' },
        { status: 403 }
      );
    }

    // Buscar subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    
    if (!sendToAll && userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Erro ao buscar subscriptions:', fetchError);
      return NextResponse.json(
        { error: 'Erro ao buscar subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'Nenhuma subscription encontrada' },
        { status: 200 }
      );
    }

    // Preparar payload da notificação
    const notificationPayload: PushPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
    };

    // Enviar notificações
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notificationPayload)
          );

          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          console.error(`Erro ao enviar para ${subscription.endpoint}:`, error);
          
          // Se a subscription é inválida, remover do banco
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
          }

          return { success: false, endpoint: subscription.endpoint, error: error.message };
        }
      })
    );

    // Contar sucessos e falhas
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Notificações enviadas: ${successful} sucessos, ${failed} falhas`,
      sent: successful,
      failed: failed,
      total: results.length,
    });
    
  } catch (error) {
    console.error('Erro ao enviar push notifications:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Aplicar rate limiting ao handler (configuração mais restritiva para admin)
export const POST = withRateLimit(postHandler, rateLimitConfigs.admin);