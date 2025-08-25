import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Clock, Star, Users, ChefHat, Tag, MapPin, SlidersHorizontal } from 'lucide-react';
import { useAdvancedSearch, useAutocomplete, useSearchHistory, SearchFilters } from '../hooks/useAdvancedSearch';
import { useDebounce } from '../hooks/useDebounce';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time: number;
  rating: number;
  servings: number;
}

interface AdvancedSearchProps {
  onResultsChange?: (results: Recipe[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export function AdvancedSearch({
  onResultsChange,
  onFiltersChange,
  className = '',
  placeholder = 'Buscar receitas, ingredientes...',
  showFilters = true,
  compact = false
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  
  // Hooks de busca
  const {
    results,
    total,
    totalPages,
    suggestions,
    availableFilters,
    isLoading,
    hasResults,
    updateFilters,
    clearFilters
  } = useAdvancedSearch({ ...activeFilters, query }, currentPage);
  
  // const suggestions = [
  //   'Receitas veganas',
  //   'Pratos rápidos',
  //   'Sobremesas sem açúcar',
  //   'Comida italiana',
  //   'Receitas fitness'
  // ];
  // const availableFilters = {
  //   difficulty: ['Fácil', 'Médio', 'Difícil'],
  //   time: ['Até 15 min', '15-30 min', '30-60 min', 'Mais de 1h'],
  //   diet: ['Vegetariana', 'Vegana', 'Sem glúten', 'Low carb'],
  //   category: ['Entrada', 'Prato principal', 'Sobremesa', 'Bebida']
  // };
  
  const { suggestions: autocompleteSuggestions, isLoading: isLoadingAutocomplete } = useAutocomplete(query);
  const { history, addToHistory, removeFromHistory } = useSearchHistory();
  
  // Debounce para otimizar performance
  const debouncedQuery = useDebounce(query, 300);
  
  // Efeitos
  useEffect(() => {
    if (onResultsChange) {
      onResultsChange(results);
    }
  }, [results, onResultsChange]);
  
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({ ...activeFilters, query: debouncedQuery });
    }
  }, [activeFilters, debouncedQuery, onFiltersChange]);
  
  // Fechar autocomplete ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handlers
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    updateFilters({ query: searchQuery });
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim());
    }
    setShowAutocomplete(false);
    setCurrentPage(1);
  };
  
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...activeFilters, ...newFilters };
    setActiveFilters(updatedFilters);
    updateFilters(updatedFilters);
    setCurrentPage(1);
  };
  
  const handleClearFilters = () => {
    setActiveFilters({});
    setQuery('');
    clearFilters();
    setCurrentPage(1);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };
  
  // Contar filtros ativos
  const activeFilterCount = Object.keys(activeFilters).filter(key => {
    const value = activeFilters[key as keyof SearchFilters];
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
  }).length;
  
  return (
    <div className={`relative ${className}`}>
      {/* Barra de busca principal */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowAutocomplete(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`
                w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-orange-500 focus:border-transparent
                transition-all duration-200
                ${compact ? 'py-2 text-sm' : 'py-3'}
              `}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  handleSearch('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`
                ml-3 px-4 py-3 border border-gray-300 rounded-lg
                hover:bg-gray-50 transition-colors duration-200
                flex items-center gap-2
                ${showFilterPanel ? 'bg-orange-50 border-orange-300' : ''}
                ${compact ? 'py-2 px-3' : 'py-3 px-4'}
              `}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {!compact && <span>Filtros</span>}
              {activeFilterCount > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
        
        {/* Autocomplete */}
        {showAutocomplete && (query.length >= 2 || history.length > 0) && (
          <div
            ref={autocompleteRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {/* Histórico de buscas */}
            {query.length < 2 && history.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Buscas recentes</h4>
                <div className="space-y-1">
                  {history.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {item}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(item);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sugestões de autocomplete */}
            {query.length >= 2 && (
              <div className="p-3">
                {isLoadingAutocomplete ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                ) : autocompleteSuggestions.length > 0 ? (
                  <div className="space-y-1">
                    {autocompleteSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        {suggestion.type === 'recipe' && <ChefHat className="w-4 h-4 text-orange-500" />}
                        {suggestion.type === 'ingredient' && <Tag className="w-4 h-4 text-green-500" />}
                        {suggestion.type === 'category' && <Filter className="w-4 h-4 text-blue-500" />}
                        {suggestion.type === 'cuisine' && <MapPin className="w-4 h-4 text-purple-500" />}
                        <span>{suggestion.text}</span>
                        {suggestion.count && (
                          <span className="text-xs text-gray-400 ml-auto">({suggestion.count})</span>
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
          </div>
        )}
      </div>
      
      {/* Painel de filtros */}
      {showFilterPanel && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filtros Avançados</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                Limpar filtros
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dificuldade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificuldade
              </label>
              <select
                value={activeFilters.difficulty || ''}
                onChange={(e) => handleFilterChange({ difficulty: e.target.value ? e.target.value as 'easy' | 'medium' | 'hard' : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Todas</option>
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
            
            {/* Tempo de preparo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo máximo (min)
              </label>
              <input
                type="number"
                value={activeFilters.maxPrepTime || ''}
                onChange={(e) => handleFilterChange({ maxPrepTime: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Ex: 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            {/* Avaliação mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliação mínima
              </label>
              <select
                value={activeFilters.minRating || ''}
                onChange={(e) => handleFilterChange({ minRating: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Qualquer</option>
                <option value="4">4+ estrelas</option>
                <option value="3">3+ estrelas</option>
                <option value="2">2+ estrelas</option>
              </select>
            </div>
            
            {/* Porções */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porções
              </label>
              <input
                type="number"
                value={activeFilters.servings || ''}
                onChange={(e) => handleFilterChange({ servings: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Ex: 4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={activeFilters.sortBy || 'relevance'}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'relevance' | 'rating' | 'prep_time' | 'created_at' | 'views' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="relevance">Relevância</option>
                <option value="rating">Avaliação</option>
                <option value="prep_time">Tempo de preparo</option>
                <option value="created_at">Mais recentes</option>
                <option value="views">Mais visualizadas</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Filtros ativos */}
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            const getFilterLabel = () => {
              switch (key) {
                case 'difficulty':
                  return `Dificuldade: ${value === 'easy' ? 'Fácil' : value === 'medium' ? 'Médio' : 'Difícil'}`;
                case 'maxPrepTime':
                  return `Máx ${value}min`;
                case 'minRating':
                  return `${value}+ estrelas`;
                case 'servings':
                  return `${value} porções`;
                case 'sortBy':
                  return `Ordenar: ${value}`;
                default:
                  return `${key}: ${value}`;
              }
            };
            
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
              >
                {getFilterLabel()}
                <button
                  onClick={() => {
                    const newFilters = { ...activeFilters };
                    delete newFilters[key as keyof SearchFilters];
                    setActiveFilters(newFilters);
                    updateFilters(newFilters);
                  }}
                  className="text-orange-600 hover:text-orange-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      
      {/* Resultados */}
      {(hasResults || isLoading) && (
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Buscando receitas...</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {total} receita{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </div>
              
              {/* Grid de resultados */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 relative">
                      {recipe.image_url && (
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium">
                        {recipe.difficulty === 'easy' ? 'Fácil' : recipe.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {recipe.prep_time}min
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {recipe.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {recipe.servings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}