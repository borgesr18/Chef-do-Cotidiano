export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  rating: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
}

export interface RecipeFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  prep_time_max?: number;
  ingredients?: string[];
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface RecipeStats {
  total_recipes: number;
  total_views: number;
  total_likes: number;
  popular_categories: Array<{
    category: string;
    count: number;
  }>;
  views: number;
  likes: number;
  saves: number;
  shares: number;
}