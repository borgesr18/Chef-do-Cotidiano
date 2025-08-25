import React, { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  Eye,
  Heart,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAnalyticsMetrics, useAnalyticsEvents } from '../hooks/useAnalytics';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// interface DateRange {
//   start: Date;
//   end: Date;
// }

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

const AnalyticsDashboard: React.FC = () => {
  const [dateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [selectedMetric, setSelectedMetric] = useState<string>('pageViews');
  const [refreshing, setRefreshing] = useState(false);

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useAnalyticsMetrics({
    dateRange: {
      start: dateRange.start,
      end: dateRange.end
    }
  });

  const { data: events, isLoading: eventsLoading } = useAnalyticsEvents({
    dateRange: {
      start: dateRange.start,
      end: dateRange.end
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchMetrics();
    setRefreshing(false);
  };

  const metricCards: MetricCard[] = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        title: 'Visualizações de Página',
        value: metrics.totalPageViews.toLocaleString(),
        change: 0, // Implementar cálculo de mudança
        icon: <Eye className="w-6 h-6" />,
        color: 'text-blue-600'
      },
      {
        title: 'Visitantes Únicos',
        value: metrics.uniqueVisitors.toLocaleString(),
        change: 0, // Implementar cálculo de mudança
        icon: <Users className="w-6 h-6" />,
        color: 'text-green-600'
      },
      {
        title: 'Taxa de Conversão',
        value: `${(metrics.conversionRate * 100).toFixed(1)}%`,
        change: 0, // Implementar cálculo de mudança
        icon: <Search className="w-6 h-6" />,
        color: 'text-purple-600'
      },
      {
        title: 'Taxa de Erro',
        value: `${(metrics.errorRate * 100).toFixed(1)}%`,
        change: 0, // Implementar cálculo de mudança
        icon: <Heart className="w-6 h-6" />,
        color: 'text-red-600'
      }
    ];
  }, [metrics]);

  const chartData = useMemo(() => {
    if (!events) return [];

    interface DailyData {
      date: string;
      pageViews: number;
      searches: number;
      favorites: number;
      comments: number;
    }
    
    const dailyData = new Map<string, DailyData>();
    
    events.forEach(event => {
      const date = format(new Date(event.timestamp), 'yyyy-MM-dd');
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          pageViews: 0,
          searches: 0,
          favorites: 0,
          comments: 0
        });
      }
      
      const dayData = dailyData.get(date)!;
      switch (event.type) {
        case 'page_view':
          dayData.pageViews++;
          break;
        case 'search':
          dayData.searches++;
          break;
        case 'recipe_like':
          dayData.favorites++;
          break;
        case 'form_submit':
          dayData.comments++;
          break;
      }
    });

    return Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [events]);

  const topPages = useMemo(() => {
    if (!events) return [];

    const pageViews = new Map<string, number>();
    events
      .filter(event => event.type === 'page_view')
      .forEach(event => {
        const page = event.properties?.page as string || 'Desconhecida';
        pageViews.set(page, (pageViews.get(page) || 0) + 1);
      });

    return Array.from(pageViews.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [events]);

  const searchTerms = useMemo(() => {
    if (!events) return [];

    const terms = new Map<string, number>();
    events
      .filter(event => event.type === 'search')
      .forEach(event => {
        const term = event.properties?.query as string || 'Termo vazio';
        terms.set(term, (terms.get(term) || 0) + 1);
      });

    return Array.from(terms.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [events]);

  const deviceData = useMemo(() => {
    if (!events) return [];

    const devices = new Map<string, number>();
    events.forEach(event => {
      const device = event.properties?.device as string || 'Desconhecido';
      devices.set(device, (devices.get(device) || 0) + 1);
    });

    return Array.from(devices.entries())
      .map(([name, value]) => ({ name, value }));
  }, [events]);

  const exportData = () => {
    const dataToExport = {
      metrics,
      chartData,
      topPages,
      searchTerms,
      deviceData,
      dateRange,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (metricsLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Analytics</h1>
          <p className="text-gray-600 mt-1">
            Período: {format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className={card.color}>
                {card.icon}
              </div>
              <div className={`text-sm font-medium ${
                card.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change >= 0 ? '+' : ''}{card.change.toFixed(1)}%
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tendências Diárias</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border rounded-md px-3 py-1"
            >
              <option value="pageViews">Visualizações</option>
              <option value="searches">Buscas</option>
              <option value="favorites">Favoritos</option>
              <option value="comments">Comentários</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date: string) => format(new Date(date), 'dd/MM')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date: string) => format(new Date(date), 'dd/MM/yyyy')}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#f97316" 
                fill="#fed7aa" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Dispositivo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const name = (props as any).name as string | undefined;
                  const percent = (props as any).percent as number | undefined;
                  return name && typeof percent === 'number' ? `${name} ${(percent * 100).toFixed(0)}%` : '';
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Páginas Mais Visitadas</h3>
          <div className="space-y-3">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm text-gray-900 truncate">{page.page}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {page.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Search Terms */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Termos Mais Buscados</h3>
          <div className="space-y-3">
            {searchTerms.map((term, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm text-gray-900 truncate">{term.term}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {term.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;