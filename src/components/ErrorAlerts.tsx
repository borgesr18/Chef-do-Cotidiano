import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Settings,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAnalyticsEvents } from '../hooks/useAnalytics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ErrorAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  count: number;
  acknowledged: boolean;
  source?: string;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
}

interface AlertSettings {
  enabled: boolean;
  criticalOnly: boolean;
  soundEnabled: boolean;
  emailEnabled: boolean;
  slackEnabled: boolean;
}

const ErrorAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<ErrorAlert[]>([]);
  const [settings, setSettings] = useState<AlertSettings>({
    enabled: true,
    criticalOnly: false,
    soundEnabled: true,
    emailEnabled: false,
    slackEnabled: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'unacknowledged'>('all');

  const { data: events, refetch } = useAnalyticsEvents({
    dateRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
      end: new Date()
    },
    eventType: 'error'
  });

  // Processar eventos de erro em alertas
  useEffect(() => {
    if (!events) return;

    const errorMap = new Map<string, ErrorAlert>();

    events
      .filter(event => event.type === 'error')
      .forEach(event => {
        const errorKey = `${event.properties?.error as string || 'Unknown'}-${event.properties?.source as string || 'Unknown'}`;
        
        if (errorMap.has(errorKey)) {
          const existing = errorMap.get(errorKey)!;
          existing.count++;
          if (new Date(event.timestamp) > existing.timestamp) {
            existing.timestamp = new Date(event.timestamp);
          }
        } else {
          const severity = determineSeverity(event.properties?.error as string);
          errorMap.set(errorKey, {
            id: errorKey,
            type: severity,
            title: event.properties?.error as string || 'Erro Desconhecido',
            message: event.properties?.message as string || 'Nenhuma mensagem disponível',
            timestamp: new Date(event.timestamp),
            count: 1,
            acknowledged: false,
            source: event.properties?.source as string,
            stackTrace: event.properties?.stackTrace as string,
            userAgent: event.properties?.userAgent as string,
            url: event.properties?.url as string
          });
        }
      });

    const newAlerts = Array.from(errorMap.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setAlerts(prev => {
      // Manter status de acknowledged dos alertas existentes
      const prevMap = new Map(prev.map(alert => [alert.id, alert.acknowledged]));
      return newAlerts.map(alert => ({
        ...alert,
        acknowledged: prevMap.get(alert.id) || false
      }));
    });
  }, [events]);

  // Reproduzir som para novos alertas críticos
  useEffect(() => {
    if (!settings.enabled || !settings.soundEnabled) return;

    const criticalAlerts = alerts.filter(
      alert => alert.type === 'critical' && !alert.acknowledged
    );

    if (criticalAlerts.length > 0) {
      playAlertSound();
    }
  }, [alerts, settings]);

  const determineSeverity = (error?: string): 'critical' | 'warning' | 'info' => {
    if (!error) return 'info';

    const criticalKeywords = [
      'database',
      'connection',
      'timeout',
      'server error',
      'internal server error',
      'out of memory',
      'segmentation fault'
    ];

    const warningKeywords = [
      'validation',
      'not found',
      'unauthorized',
      'forbidden',
      'bad request'
    ];

    const errorLower = error.toLowerCase();
    
    if (criticalKeywords.some(keyword => errorLower.includes(keyword))) {
      return 'critical';
    }
    
    if (warningKeywords.some(keyword => errorLower.includes(keyword))) {
      return 'warning';
    }

    return 'info';
  };

  const playAlertSound = () => {
    try {
      const audio = new Audio('/sounds/alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback para navegadores que não permitem autoplay
        console.log('Não foi possível reproduzir o som de alerta');
      });
    } catch (error) {
      console.error('Erro ao reproduzir som:', error);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const acknowledgeAll = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, acknowledged: true }))
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'critical':
        return alert.type === 'critical';
      case 'warning':
        return alert.type === 'warning';
      case 'unacknowledged':
        return !alert.acknowledged;
      default:
        return true;
    }
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Alertas de Erro
            {unacknowledgedCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unacknowledgedCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {criticalCount > 0 && (
              <span className="text-red-600 font-medium">
                {criticalCount} erro(s) crítico(s) • 
              </span>
            )}
            Monitoramento em tempo real
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
          
          {unacknowledgedCount > 0 && (
            <button
              onClick={acknowledgeAll}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Reconhecer Todos
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Alertas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Alertas habilitados</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.criticalOnly}
                onChange={(e) => setSettings(prev => ({ ...prev, criticalOnly: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Apenas alertas críticos</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Som de alerta</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Notificações por email</span>
            </label>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'critical', label: 'Críticos' },
          { key: 'warning', label: 'Avisos' },
          { key: 'unacknowledged', label: 'Não Reconhecidos' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'critical' | 'warning' | 'unacknowledged')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta encontrado</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Não há alertas de erro no momento.'
                : `Não há alertas do tipo "${filter}" no momento.`
              }
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${
                getAlertBorderColor(alert.type)
              } ${alert.acknowledged ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getAlertIcon(alert.type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alert.title}
                      </h3>
                      {alert.count > 1 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {alert.count}x
                        </span>
                      )}
                      {alert.acknowledged && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Reconhecido
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{alert.message}</p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        <strong>Último ocorrido:</strong> {format(alert.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </p>
                      {alert.source && (
                        <p><strong>Origem:</strong> {alert.source}</p>
                      )}
                      {alert.url && (
                        <p><strong>URL:</strong> {alert.url}</p>
                      )}
                    </div>
                    
                    {alert.stackTrace && (
                      <details className="mt-3">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          Ver stack trace
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {alert.stackTrace}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Reconhecer alerta"
                    >
                      <BellOff className="w-4 h-4" />
                    </button>
                  )}
                  
                  {alert.url && (
                    <button
                      onClick={() => window.open(alert.url, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Abrir URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ErrorAlerts;