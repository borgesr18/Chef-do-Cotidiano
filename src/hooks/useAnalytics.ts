import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '../lib/cache';

// Tipos para analytics
export interface AnalyticsEvent {
  id: string;
  type: EventType;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  referrer?: string;
}

export type EventType = 
  | 'page_view'
  | 'click'
  | 'form_submit'
  | 'search'
  | 'recipe_view'
  | 'recipe_like'
  | 'recipe_share'
  | 'user_signup'
  | 'user_login'
  | 'course_view'
  | 'course_purchase'
  | 'error'
  | 'performance';

export type EventCategory = 
  | 'navigation'
  | 'engagement'
  | 'conversion'
  | 'content'
  | 'user'
  | 'commerce'
  | 'system';

export interface AnalyticsMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number }>;
  topRecipes: Array<{ id: string; title: string; views: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  conversionRate: number;
  errorRate: number;
  performanceMetrics: {
    averageLoadTime: number;
    coreWebVitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
  };
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  eventType?: EventType;
  category?: EventCategory;
  userId?: string;
  page?: string;
}

// Session management
class SessionManager {
  private static instance: SessionManager;
  private sessionId: string;
  private startTime: Date;
  
  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
  }
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }
  
  getSessionId(): string {
    return this.sessionId;
  }
  
  getSessionDuration(): number {
    return Date.now() - this.startTime.getTime();
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  renewSession(): void {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
  }
}

// Analytics store (em memória para desenvolvimento)
class AnalyticsStore {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 10000;
  
  addEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    
    // Manter apenas os eventos mais recentes
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Persistir no localStorage para desenvolvimento
    if (typeof window !== 'undefined') {
      try {
        const recentEvents = this.events.slice(-100); // Manter apenas 100 eventos mais recentes
        localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
      } catch (error) {
        console.warn('Failed to persist analytics events:', error);
      }
    }
  }
  
  getEvents(filters?: Partial<AnalyticsFilters>): AnalyticsEvent[] {
    let filteredEvents = [...this.events];
    
    if (filters?.dateRange) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= filters.dateRange!.start &&
        event.timestamp <= filters.dateRange!.end
      );
    }
    
    if (filters?.eventType) {
      filteredEvents = filteredEvents.filter(event => event.type === filters.eventType);
    }
    
    if (filters?.category) {
      filteredEvents = filteredEvents.filter(event => event.category === filters.category);
    }
    
    if (filters?.userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === filters.userId);
    }
    
    if (filters?.page) {
      filteredEvents = filteredEvents.filter(event => 
        event.url.includes(filters.page!)
      );
    }
    
    return filteredEvents;
  }
  
  calculateMetrics(filters?: Partial<AnalyticsFilters>): AnalyticsMetrics {
    const events = this.getEvents(filters);
    const pageViews = events.filter(e => e.type === 'page_view');
    const uniqueVisitors = new Set(events.map(e => e.sessionId)).size;
    
    // Calcular duração média da sessão
    const sessionDurations = new Map<string, number>();
    events.forEach(event => {
      if (!sessionDurations.has(event.sessionId)) {
        sessionDurations.set(event.sessionId, 0);
      }
    });
    
    const averageSessionDuration = sessionDurations.size > 0 
      ? Array.from(sessionDurations.values()).reduce((a, b) => a + b, 0) / sessionDurations.size
      : 0;
    
    // Top páginas
    const pageViewCounts = new Map<string, number>();
    pageViews.forEach(event => {
      const path = new URL(event.url).pathname;
      pageViewCounts.set(path, (pageViewCounts.get(path) || 0) + 1);
    });
    
    const topPages = Array.from(pageViewCounts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // Top receitas
    const recipeViews = events.filter(e => e.type === 'recipe_view');
    const recipeViewCounts = new Map<string, { title: string; views: number }>();
    recipeViews.forEach(event => {
      const recipeId = event.properties?.recipeId;
      const title = (event.properties?.title as string) || 'Receita sem título';
      if (recipeId && typeof recipeId === 'string') {
        const current = recipeViewCounts.get(recipeId) || { title, views: 0 };
        recipeViewCounts.set(recipeId, { title, views: current.views + 1 });
      }
    });
    
    const topRecipes = Array.from(recipeViewCounts.entries())
      .map(([id, data]) => ({ id, title: data.title, views: data.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // Métricas de performance
    const performanceEvents = events.filter(e => e.type === 'performance');
    const loadTimes = performanceEvents
      .map(e => e.properties?.loadTime)
      .filter(time => typeof time === 'number');
    
    const averageLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
      : 0;
    
    return {
      totalPageViews: pageViews.length,
      uniqueVisitors,
      averageSessionDuration,
      bounceRate: 0, // Implementar cálculo real
      topPages,
      topRecipes,
      userGrowth: [], // Implementar cálculo real
      conversionRate: 0, // Implementar cálculo real
      errorRate: events.filter(e => e.type === 'error').length / events.length,
      performanceMetrics: {
        averageLoadTime,
        coreWebVitals: {
          lcp: 0, // Implementar medição real
          fid: 0, // Implementar medição real
          cls: 0  // Implementar medição real
        }
      }
    };
  }
  
  clear(): void {
    this.events = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_events');
    }
  }
  
  // Carregar eventos do localStorage na inicialização
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('analytics_events');
        if (stored) {
          const events = JSON.parse(stored);
          this.events = events.map((e: AnalyticsEvent) => ({
            ...e,
            timestamp: new Date(e.timestamp)
          }));
        }
      } catch (error) {
        console.warn('Failed to load analytics events from storage:', error);
      }
    }
  }
}

// Instância global do store
const analyticsStore = new AnalyticsStore();
analyticsStore.loadFromStorage();

// Hook principal para analytics
export function useAnalytics() {
  const sessionManager = SessionManager.getInstance();
  
  const trackEvent = useCallback(({
    type,
    category,
    action,
    label,
    value,
    properties = {}
  }: {
    type: EventType;
    category: EventCategory;
    action: string;
    label?: string;
    value?: number;
    properties?: Record<string, unknown>;
  }) => {
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      action,
      label,
      value,
      properties,
      sessionId: sessionManager.getSessionId(),
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined
    };
    
    analyticsStore.addEvent(event);
    
    // Em produção, enviar para serviço de analytics
    if (process.env.NODE_ENV === 'production') {
      // Implementar envio para Google Analytics, Mixpanel, etc.
    }
  }, [sessionManager]);
  
  // Funções de conveniência
  const trackPageView = useCallback((page?: string) => {
    trackEvent({
      type: 'page_view',
      category: 'navigation',
      action: 'page_view',
      properties: {
        page: page || window.location.pathname
      }
    });
  }, [trackEvent]);
  
  const trackClick = useCallback((element: string, properties?: Record<string, unknown>) => {
    trackEvent({
      type: 'click',
      category: 'engagement',
      action: 'click',
      label: element,
      properties
    });
  }, [trackEvent]);
  
  const trackSearch = useCallback((query: string, results?: number) => {
    trackEvent({
      type: 'search',
      category: 'engagement',
      action: 'search',
      label: query,
      value: results,
      properties: { query, results }
    });
  }, [trackEvent]);
  
  const trackRecipeView = useCallback((recipeId: string, title: string) => {
    trackEvent({
      type: 'recipe_view',
      category: 'content',
      action: 'view_recipe',
      label: title,
      properties: { recipeId, title }
    });
  }, [trackEvent]);
  
  const trackError = useCallback((error: Error, context?: string) => {
    trackEvent({
      type: 'error',
      category: 'system',
      action: 'error',
      label: error.message,
      properties: {
        error: error.message,
        stack: error.stack,
        context
      }
    });
  }, [trackEvent]);
  
  return {
    trackEvent,
    trackPageView,
    trackClick,
    trackSearch,
    trackRecipeView,
    trackError
  };
}

// Hook para métricas
export function useAnalyticsMetrics(filters?: Partial<AnalyticsFilters>) {
  return useQuery({
    queryKey: [cacheKeys.analytics.metrics, filters],
    queryFn: () => analyticsStore.calculateMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30 * 1000 // Atualizar a cada 30 segundos
  });
}

// Hook para eventos
export function useAnalyticsEvents(filters?: Partial<AnalyticsFilters>) {
  return useQuery({
    queryKey: [cacheKeys.analytics.events, filters],
    queryFn: () => analyticsStore.getEvents(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 10 * 1000 // Atualizar a cada 10 segundos
  });
}

// Hook para tracking automático de page views
export function usePageTracking() {
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);
}

// Hook para performance monitoring
export function usePerformanceTracking() {
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    // Medir Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        trackEvent({
          type: 'performance',
          category: 'system',
          action: 'lcp',
          value: lastEntry.startTime,
          properties: {
            metric: 'lcp',
            value: lastEntry.startTime
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observation not supported:', error);
      }
      
      // Load time
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        
        trackEvent({
          type: 'performance',
          category: 'system',
          action: 'load_time',
          value: loadTime,
          properties: {
            metric: 'load_time',
            value: loadTime
          }
        });
      });
    }
  }, [trackEvent]);
}

// Utilitários
export const analyticsUtils = {
  clearData: () => analyticsStore.clear(),
  exportData: (filters?: Partial<AnalyticsFilters>) => {
    const events = analyticsStore.getEvents(filters);
    const metrics = analyticsStore.calculateMetrics(filters);
    
    return {
      events,
      metrics,
      exportedAt: new Date().toISOString()
    };
  },
  getSessionDuration: () => SessionManager.getInstance().getSessionDuration()
};