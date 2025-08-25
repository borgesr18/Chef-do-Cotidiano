'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient, persistCache } from '@/lib/cache';
import { useEffect } from 'react';

interface CacheProviderProps {
  children: React.ReactNode;
}

export function CacheProvider({ children }: CacheProviderProps) {
  useEffect(() => {
    // Restaurar cache do localStorage na inicialização
    persistCache.restore();
    
    // Salvar cache periodicamente
    const interval = setInterval(() => {
      persistCache.save();
    }, 5 * 60 * 1000); // A cada 5 minutos
    
    // Salvar cache antes de sair da página
    const handleBeforeUnload = () => {
      persistCache.save();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      persistCache.save();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}

// Hook para monitoramento de performance do cache
export function useCacheMonitoring() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logCacheStats = () => {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        
        console.group('📊 Cache Statistics');
        console.log('Total queries:', queries.length);
        console.log('Fresh queries:', queries.filter(q => !q.isStale()).length);
        console.log('Stale queries:', queries.filter(q => q.isStale()).length);
        console.log('Loading queries:', queries.filter(q => q.state.fetchStatus === 'fetching').length);
        console.log('Error queries:', queries.filter(q => q.state.status === 'error').length);
        console.groupEnd();
      };
      
      // Log stats a cada 30 segundos em desenvolvimento
      const interval = setInterval(logCacheStats, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);
}