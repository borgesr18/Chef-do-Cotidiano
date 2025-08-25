'use client';

import { useState, useEffect, useCallback } from 'react';

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}

interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<NotificationPermissionState>({
    permission: 'default',
    isSupported: false,
    isSubscribed: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Verificar suporte e estado inicial
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
      
      if (isSupported) {
        const permission = Notification.permission;
        let isSubscribed = false;

        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          isSubscribed = !!subscription;
        } catch (error) {
          console.warn('Erro ao verificar subscription:', error);
        }

        setState({
          permission,
          isSupported,
          isSubscribed,
        });
      } else {
        setState({
          permission: 'denied',
          isSupported: false,
          isSubscribed: false,
        });
      }
    };

    checkSupport();
  }, []);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('Push notifications não são suportadas neste navegador');
      return false;
    }

    setIsLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
      }));

      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.isSupported]);

  // Registrar para push notifications
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID key pública (você deve gerar suas próprias chaves)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HtLlVLVWjbzgSjN6QjvOUHBmcfBo3UYdGd-Rqvr_7LkHUi8rE';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
      }));

      // Enviar subscription para o servidor
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Erro ao registrar push subscription:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [state.permission, requestPermission]);

  // Cancelar subscription
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remover do servidor
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
      }));

      return true;
    } catch (error) {
      console.error('Erro ao cancelar subscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar notificação local
  const showNotification = useCallback(async (options: PushNotificationOptions): Promise<boolean> => {
    if (state.permission !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/icon-72x72.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: false,
        silent: false,
      });

      return true;
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      return false;
    }
  }, [state.permission]);

  // Notificações pré-definidas para o Chef do Cotidiano
  const notifyNewRecipe = useCallback((recipeName: string, recipeId: string) => {
    return showNotification({
      title: 'Nova Receita Disponível! 👨‍🍳',
      body: `Confira a receita: ${recipeName}`,
      tag: 'new-recipe',
      data: { type: 'new-recipe', recipeId },
      actions: [
        {
          action: 'view',
          title: 'Ver Receita',
          icon: '/icons/icon-72x72.png',
        },
        {
          action: 'dismiss',
          title: 'Dispensar',
        },
      ],
    });
  }, [showNotification]);

  const notifyDailyTip = useCallback((tip: string) => {
    return showNotification({
      title: 'Dica do Chef 💡',
      body: tip,
      tag: 'daily-tip',
      data: { type: 'daily-tip' },
    });
  }, [showNotification]);

  const notifyWeeklyMenu = useCallback(() => {
    return showNotification({
      title: 'Menu da Semana Disponível! 📅',
      body: 'Planeje suas refeições com nossas sugestões semanais',
      tag: 'weekly-menu',
      data: { type: 'weekly-menu' },
      actions: [
        {
          action: 'view-menu',
          title: 'Ver Menu',
          icon: '/icons/icon-72x72.png',
        },
      ],
    });
  }, [showNotification]);

  return {
    // Estado
    permission: state.permission,
    isSupported: state.isSupported,
    isSubscribed: state.isSubscribed,
    isLoading,
    
    // Ações
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    
    // Notificações específicas
    notifyNewRecipe,
    notifyDailyTip,
    notifyWeeklyMenu,
  };
};

// Utilitário para converter VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}