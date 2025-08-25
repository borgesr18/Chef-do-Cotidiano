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

export const LazyImage: React.FC<LazyImageProps> = ({
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
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Fallback quando erro */}
      {imageError && (
        <img
          src={fallback}
          alt={`${alt} (fallback)`}
          width={width}
          height={height}
          className="w-full h-full object-cover"
        />
      )}

      {/* Overlay de carregamento */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
      )}
    </div>
  );
}