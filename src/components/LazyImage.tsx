import React, { useState } from 'react';
import { useLazyImage } from '../hooks/useLazyLoading';
import { cn } from '../lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  placeholder,
  fallback = '/images/recipe-placeholder.jpg',
  onLoad,
  onError,
  priority = false,
  sizes,
}) => {
  const [imageError, setImageError] = useState(false);
  
  const { ref, src: lazySrc, isLoaded, error, isVisible } = useLazyImage(src, {
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  // Se é prioridade, carrega imediatamente
  const shouldLoad = priority || isVisible;
  const imageSrc = shouldLoad ? (imageError ? fallback : lazySrc || src) : placeholder;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        className
      )}
      style={{ width, height }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && !priority && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Imagem principal */}
      {(shouldLoad || priority) && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded || priority ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Overlay de erro */}
      {(error || imageError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Imagem não disponível</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;

// Componente específico para imagens de receitas
export const RecipeImage: React.FC<{
  recipe: {
    id: string;
    title: string;
    image_url?: string;
  };
  className?: string;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ recipe, className, priority = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  };

  const dimensions = {
    sm: { width: 64, height: 64 },
    md: { width: 128, height: 128 },
    lg: { width: 192, height: 192 },
    xl: { width: 256, height: 256 },
  };

  return (
    <LazyImage
      src={recipe.image_url || ''}
      alt={recipe.title}
      className={cn(
        'rounded-lg',
        sizeClasses[size],
        className
      )}
      width={dimensions[size].width}
      height={dimensions[size].height}
      placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnJlZ2FuZG8uLi48L3RleHQ+PC9zdmc+"
      fallback="/images/recipe-placeholder.jpg"
      priority={priority}
      sizes={`${dimensions[size].width}px`}
    />
  );
};

// Componente para avatar de usuário
export const UserAvatar: React.FC<{
  user: {
    name: string;
    avatar_url?: string;
  };
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}> = ({ user, className, size = 'md' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const dimensions = {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
  };

  // Gerar avatar com iniciais se não houver imagem
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.name);
  const avatarPlaceholder = `data:image/svg+xml;base64,${btoa(
    `<svg width="${dimensions[size].width}" height="${dimensions[size].height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#3B82F6"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(dimensions[size].width * 0.4)}" fill="white" text-anchor="middle" dy=".3em">${initials}</text></svg>`
  )}`;

  return (
    <LazyImage
      src={user.avatar_url || ''}
      alt={`Avatar de ${user.name}`}
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
      width={dimensions[size].width}
      height={dimensions[size].height}
      placeholder={avatarPlaceholder}
      fallback={avatarPlaceholder}
      priority={false}
    />
  );
};