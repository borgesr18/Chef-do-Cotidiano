'use client';

import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, Settings, Check, X } from 'lucide-react';

interface PushNotificationSettingsProps {
  className?: string;
  showTitle?: boolean;
}

export default function PushNotificationSettings({ 
  className = '',
  showTitle = true 
}: PushNotificationSettingsProps) {
  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    notifyDailyTip,
  } = usePushNotifications();

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (permission === 'granted') {
        await subscribe();
      } else {
        const granted = await requestPermission();
        if (granted) {
          await subscribe();
        }
      }
    }
  };

  const handleTestNotification = async () => {
    await notifyDailyTip('Esta é uma notificação de teste! 🧪 Suas notificações estão funcionando perfeitamente.');
  };

  if (!isSupported) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900">Notificações não suportadas</h3>
            <p className="text-sm text-gray-600">
              Seu navegador não suporta push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: isSubscribed ? Bell : BellOff,
          color: isSubscribed ? 'text-green-600' : 'text-orange-600',
          bgColor: isSubscribed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200',
          status: isSubscribed ? 'Ativas' : 'Disponíveis',
          description: isSubscribed 
            ? 'Você receberá notificações sobre novas receitas e dicas.'
            : 'Clique para ativar e receber notificações.',
        };
      case 'denied':
        return {
          icon: X,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          status: 'Bloqueadas',
          description: 'Notificações foram bloqueadas. Altere nas configurações do navegador.',
        };
      default:
        return {
          icon: Bell,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          status: 'Disponíveis',
          description: 'Ative para receber notificações sobre novas receitas.',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`${statusInfo.bgColor} border rounded-lg p-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Notificações Push</h3>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <StatusIcon className={`w-6 h-6 ${statusInfo.color} mt-0.5`} />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium ${statusInfo.color}`}>
              {statusInfo.status}
            </span>
            {isSubscribed && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {statusInfo.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {permission !== 'denied' && (
              <button
                onClick={handleToggleNotifications}
                disabled={isLoading}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isSubscribed 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-red-50' 
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:bg-orange-50'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </span>
                ) : (
                  isSubscribed ? 'Desativar' : 'Ativar'
                )}
              </button>
            )}
            
            {isSubscribed && (
              <button
                onClick={handleTestNotification}
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
              >
                Testar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {permission === 'denied' && (
        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Como reativar:</strong>
          </p>
          <ul className="text-sm text-red-600 mt-1 space-y-1">
            <li>• Chrome: Clique no ícone de cadeado na barra de endereços</li>
            <li>• Firefox: Clique no ícone de escudo na barra de endereços</li>
            <li>• Safari: Vá em Preferências &gt; Sites &gt; Notificações</li>
          </ul>
        </div>
      )}
    </div>
  );
}