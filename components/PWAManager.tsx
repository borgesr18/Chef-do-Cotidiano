'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PWAManagerProps {
  children?: React.ReactNode;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAManager({ children }: PWAManagerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkIfInstalled();

    // Registrar Service Worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          setSwRegistration(registration);
          console.log('Service Worker registrado:', registration);

          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  toast('Nova versão disponível!', {
                    description: 'Clique para atualizar o aplicativo',
                    action: {
                      label: 'Atualizar',
                      onClick: () => {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                      }
                    },
                    duration: 10000
                  });
                }
              });
            }
          });

          // Listener para mensagens do SW
          navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, payload } = event.data;
            
            switch (type) {
              case 'CACHE_STATUS':
                console.log('Status do cache:', payload);
                break;
              case 'CACHE_CLEARED':
                toast.success('Cache limpo com sucesso!');
                break;
            }
          });

        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error);
        }
      }
    };

    registerSW();

    // Listener para prompt de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar toast para instalação
      if (!isInstalled) {
        setTimeout(() => {
          toast('Instalar Chef do Cotidiano', {
            description: 'Adicione o app à sua tela inicial para acesso rápido',
            action: {
              label: 'Instalar',
              onClick: handleInstallClick
            },
            duration: 8000
          });
        }, 3000);
      }
    };

    // Listeners de conexão
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada!', {
        description: 'Você está online novamente'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Você está offline', {
        description: 'Algumas funcionalidades podem estar limitadas'
      });
    };

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar status inicial da conexão
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('App instalado com sucesso!');
        setIsInstalled(true);
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Erro na instalação:', error);
      toast.error('Erro ao instalar o app');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          toast.success('Notificações ativadas!');
          
          // Registrar para push notifications se houver SW
          if (swRegistration) {
            try {
              const subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
              });
              
              // Enviar subscription para o servidor
              await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
              });
              
              console.log('Push subscription registrada:', subscription);
            } catch (error) {
              console.error('Erro ao registrar push subscription:', error);
            }
          }
        } else {
          toast.error('Permissão para notificações negada');
        }
      } catch (error) {
        console.error('Erro ao solicitar permissão:', error);
      }
    }
  };

  const clearCache = async () => {
    if (swRegistration) {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          toast.success('Cache limpo com sucesso!');
        }
      };
      
      swRegistration.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    }
  };

  const getCacheStatus = async () => {
    if (swRegistration) {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_STATUS') {
          console.log('Status do cache:', event.data.payload);
          toast.info('Status do cache exibido no console');
        }
      };
      
      swRegistration.active?.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      );
    }
  };

  const prefetchRecipes = async (recipes: { id: string; title: string; image_url?: string }[]) => {
    if (swRegistration) {
      swRegistration.active?.postMessage({
        type: 'PREFETCH_RECIPES',
        payload: { recipes }
      });
    }
  };

  // Expor funções globalmente para debug
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any as { pwaManager?: any }).pwaManager = {
        clearCache,
        getCacheStatus,
        requestNotificationPermission,
        prefetchRecipes,
        isOnline,
        isInstalled
      };
    }
  }, [isOnline, isInstalled]);

  return (
    <>
      {children}
      
      {/* Indicador de status offline */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          <span className="text-sm font-medium">
            📡 Você está offline - Funcionalidade limitada
          </span>
        </div>
      )}
      
      {/* Botão de instalação flutuante */}
      {installPrompt && !isInstalled && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50"
          title="Instalar App"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
          </svg>
        </button>
      )}
    </>
  );
}

// Hook para usar funcionalidades PWA
export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkConnection = () => setIsOnline(navigator.onLine);
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkConnection();
    checkInstallation();

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  return {
    isOnline,
    isInstalled,
    requestNotificationPermission: () => {
      if (typeof window !== 'undefined' && (window as any as { pwaManager?: any }).pwaManager) {
        return (window as any as { pwaManager?: any }).pwaManager.requestNotificationPermission();
      }
    },
    clearCache: () => {
      if (typeof window !== 'undefined' && (window as any as { pwaManager?: any }).pwaManager) {
        return (window as any as { pwaManager?: any }).pwaManager.clearCache();
      }
    }
  };
}