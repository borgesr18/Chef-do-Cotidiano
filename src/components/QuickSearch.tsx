import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { useAutocomplete, useSearchHistory } from '../hooks/useAdvancedSearch';
// import { useDebounce } from '@/hooks/useDebounce';

interface QuickSearchProps {
  onSearch?: (query: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
  showTrending?: boolean;
  compact?: boolean;
}

export function QuickSearch({
  onSearch,
  onSuggestionClick,
  placeholder = 'Buscar receitas...',
  className = '',
  showTrending = true,
  compact = false
}: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { suggestions, isLoading } = useAutocomplete(query, ['recipe', 'ingredient']);
  const { history, addToHistory } = useSearchHistory(5);
  
  // Debounce para otimizar performance
  // const debouncedQuery = useDebounce(query, 200);
  
  // Trending searches (dados mockados)
  const trendingSearches = [
    'Lasanha',
    'Bolo de chocolate',
    'Risotto',
    'Salada caesar',
    'Brigadeiro'
  ];
  
  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handlers
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim());
      onSearch?.(searchQuery.trim());
    }
    setShowSuggestions(false);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
    onSuggestionClick?.(suggestion);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    // Delay para permitir cliques nas sugestões
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  };
  
  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Input de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`text-gray-400 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-10 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-orange-500 focus:border-transparent
            transition-all duration-200
            ${compact ? 'py-2 text-sm' : 'py-3'}
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
          `}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        )}
      </div>
      
      {/* Sugestões */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {/* Histórico de buscas */}
          {query.length === 0 && history.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Buscas recentes
              </h4>
              <div className="space-y-1">
                {history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Trending searches */}
          {query.length === 0 && showTrending && (
            <div className="p-3 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Em alta
              </h4>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(trend)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Autocomplete suggestions */}
          {query.length >= 2 && (
            <div className="p-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-sm text-gray-500">Buscando...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sugestões</h4>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{suggestion.text}</span>
                        <span className="text-xs text-gray-500 capitalize">({suggestion.type})</span>
                      </span>
                      {suggestion.count && (
                        <span className="text-xs text-gray-400">{suggestion.count} resultados</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhuma sugestão encontrada
                </div>
              )}
            </div>
          )}
          
          {/* Empty state */}
          {query.length === 0 && history.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Digite para buscar receitas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente de busca inline para resultados rápidos
interface SearchResult {
  id: string;
  title: string;
  image_url: string;
  prep_time: number;
  rating: number;
}

export function InlineSearch({ onResultClick, className = '' }: {
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // // const debouncedQuery = useDebounce(query, 300);
  
  // Simular busca rápida
  useEffect(() => {
    if (query.length >= 2) {
      setIsLoading(true);
      // Simular delay de busca
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [query]);
  
  return (
    <div className={className}>
      <QuickSearch
        onSearch={(q) => setQuery(q)}
        placeholder="Busca rápida..."
        compact
        showTrending={false}
      />
      
      {/* Resultados inline */}
      {query.length >= 2 && (
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Resultados rápidos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => onResultClick?.(result)}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
                  >
                    <img
                      src={result.image_url}
                      alt={result.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">{result.title}</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{result.prep_time}min</span>
                        <span>★ {result.rating}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Nenhum resultado encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}