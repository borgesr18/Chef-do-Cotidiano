'use client';

import { useEffect, useState, useCallback } from 'react';
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

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  }, [installPrompt]);

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
          console.log('Service Worker registered successfully:', registration);

          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast('Nova versão disponível!', {
                    description: 'Clique para atualizar o aplicativo.',
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

          // Limpar cache periodicamente
          setInterval(() => {
            registration.active?.postMessage({ type: 'CLEAN_CACHE' });
          }, 24 * 60 * 60 * 1000); // 24 horas

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerSW();

    // Monitorar status de conexão
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada!', {
        description: 'Você está online novamente.'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline', {
        description: 'Algumas funcionalidades podem estar limitadas.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar toast para instalação após um tempo
      setTimeout(() => {
        if (!isInstalled) {
          toast('Instalar Chef do Cotidiano', {
            description: 'Adicione o app à sua tela inicial para acesso rápido.',
            action: {
              label: 'Instalar',
              onClick: handleInstallClick
            },
            duration: 8000
          });
        }
      }, 30000); // 30 segundos após carregar
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success('App instalado com sucesso!', {
        description: 'Chef do Cotidiano foi adicionado à sua tela inicial.'
      });
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled, handleInstallClick]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          toast.success('Notificações ativadas!', {
            description: 'Você receberá notificações sobre novas receitas.'
          });
          
          // Registrar para push notifications se houver service worker
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
              
              console.log('Push subscription successful:', subscription);
            } catch (error) {
              console.error('Push subscription failed:', error);
            }
          }
        } else {
          toast.error('Notificações negadas', {
            description: 'Você pode ativar nas configurações do navegador.'
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  // Componente de status de conexão
  const ConnectionStatus = () => {
    if (isOnline) return null;
    
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
        <span className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Você está offline - Funcionalidade limitada
        </span>
      </div>
    );
  };

  // Componente de botão de instalação
  const InstallButton = () => {
    if (isInstalled || !installPrompt) return null;
    
    return (
      <button
        onClick={handleInstallClick}
        className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 z-40"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
        </svg>
        Instalar App
      </button>
    );
  };

  // Componente de botão de notificações
  const NotificationButton = () => {
    if (!('Notification' in window) || Notification.permission === 'granted') return null;
    
    return (
      <button
        onClick={requestNotificationPermission}
        className="fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 z-40"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718A10.97 10.97 0 0112 22a10.97 10.97 0 017.132-2.282M6.343 6.343A8 8 0 1017.657 17.657" />
        </svg>
        Ativar Notificações
      </button>
    );
  };

  return (
    <>
      {children}
      <ConnectionStatus />
      <InstallButton />
      <NotificationButton />
    </>
  );
}