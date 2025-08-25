'use client';

import { useState } from 'react';
import { Heart, Clock, Users, TrendingUp, Sparkles, Eye } from 'lucide-react';
import { useRecommendations, useTrendingRecipes, useSimilarRecipes, useTrackInteraction } from '../hooks/useRecommendations';
import { LazyImage } from './LazyImage';
// Definição local da interface Recipe
interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time: number;
  rating: number;
  servings: number;
  likes_count?: number;
}
import Link from 'next/link';
import { cn } from '../lib/utils';

interface RecommendationsSectionProps {
  className?: string;
  currentRecipeId?: string;
  showTrending?: boolean;
  showPersonalized?: boolean;
  showSimilar?: boolean;
  limit?: number;
}

export default function RecommendationsSection({
  className,
  currentRecipeId,
  showTrending = true,
  showPersonalized = true,
  showSimilar = false,
  limit = 8
}: RecommendationsSectionProps) {
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'similar'>(
    showPersonalized ? 'personalized' : showTrending ? 'trending' : 'similar'
  );

  const { data: personalizedRecipes, isLoading: loadingPersonalized } = useRecommendations({
    limit,
    excludeViewed: true
  });

  const { data: trendingRecipes, isLoading: loadingTrending } = useTrendingRecipes(limit);

  const { data: similarRecipes, isLoading: loadingSimilar } = useSimilarRecipes(
    currentRecipeId || '',
    limit
  );

  const trackInteraction = useTrackInteraction();

  const handleRecipeClick = (recipeId: string) => {
    trackInteraction.mutate({
      recipeId,
      interactionType: 'view',
      metadata: {
        source: 'recommendations',
        section: activeTab
      }
    });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'personalized':
        return { data: personalizedRecipes, isLoading: loadingPersonalized };
      case 'trending':
        return { data: trendingRecipes, isLoading: loadingTrending };
      case 'similar':
        return { data: similarRecipes, isLoading: loadingSimilar };
      default:
        return { data: [], isLoading: false };
    }
  };

  const { data: currentData, isLoading } = getCurrentData();

  const tabs = [
    {
      id: 'personalized' as const,
      label: 'Para Você',
      icon: Sparkles,
      show: showPersonalized,
      description: 'Baseado no seu histórico'
    },
    {
      id: 'trending' as const,
      label: 'Em Alta',
      icon: TrendingUp,
      show: showTrending,
      description: 'Populares esta semana'
    },
    {
      id: 'similar' as const,
      label: 'Similares',
      icon: Eye,
      show: showSimilar && !!currentRecipeId,
      description: 'Receitas parecidas'
    }
  ].filter(tab => tab.show);

  if (tabs.length === 0) return null;

  return (
    <section className={cn('py-8', className)}>
      <div className="container mx-auto px-4">
        {/* Header com tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Descobrir Receitas
            </h2>
            <p className="text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* Tabs */}
          {tabs.length > 1 && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-[4/3] mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipes grid */}
        {!isLoading && currentData && currentData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentData.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!currentData || currentData.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma recomendação encontrada
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Continue explorando receitas para receber recomendações personalizadas.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Componente de card de receita
interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const trackInteraction = useTrackInteraction();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLiked(!isLiked);
    trackInteraction.mutate({
      recipeId: recipe.id,
      interactionType: 'like',
      metadata: {
        source: 'recommendations_card'
      }
    });
  };

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      onClick={onClick}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <LazyImage
          src={recipe.image_url || '/placeholder-recipe.jpg'}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Like button */}
        <button
          onClick={handleLike}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
            isLiked
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          )}
        >
          <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
        </button>

        {/* Difficulty badge */}
        {recipe.difficulty && (
          <div className="absolute top-3 left-3">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              recipe.difficulty === 'easy' && 'bg-green-100 text-green-800',
              recipe.difficulty === 'medium' && 'bg-yellow-100 text-yellow-800',
              recipe.difficulty === 'hard' && 'bg-red-100 text-red-800'
            )}>
              {recipe.difficulty === 'easy' && 'Fácil'}
              {recipe.difficulty === 'medium' && 'Médio'}
              {recipe.difficulty === 'hard' && 'Difícil'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {recipe.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {recipe.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {recipe.prep_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.prep_time}min</span>
              </div>
            )}
            
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>

          {recipe.likes_count && recipe.likes_count > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{recipe.likes_count}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}