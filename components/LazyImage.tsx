'use client';

import Image from 'next/image';
import { cn } from '../src/lib/utils';
import { useLazyImage } from '@/hooks/useLazyLoad';
import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  quality = 75,
  onLoad,
  onError,
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { elementRef, imageSrc, isLoaded, isError } = useLazyImage(src, {
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Gerar blur placeholder se não fornecido
  const defaultBlurDataURL = blurDataURL || 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  if (isError) {
    return (
      <div 
        ref={elementRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8"
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
      </div>
    );
  }

  return (
    <div ref={elementRef} className={cn('relative overflow-hidden', className)}>
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={defaultBlurDataURL}
          sizes={sizes}
          quality={quality}
          className={cn(
            'transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !isError && (
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse',
            fill ? 'w-full h-full' : ''
          )}
          style={!fill ? { width, height } : {}}
        />
      )}
    </div>
  );
}

// Componente específico para imagens de receitas
interface RecipeImageProps extends Omit<LazyImageProps, 'alt'> {
  recipeName: string;
  recipeId?: string;
}

export function RecipeImage({ 
  recipeName, 
  recipeId, 
  className,
  ...props 
}: RecipeImageProps) {
  return (
    <LazyImage
      {...props}
      alt={`Imagem da receita: ${recipeName}`}
      className={cn('rounded-lg', className)}
      onLoad={() => {
        // Analytics tracking para imagens de receitas carregadas
        if (recipeId && typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'recipe_image_loaded', {
            recipe_id: recipeId,
            recipe_name: recipeName,
            event_category: 'performance',
          });
        }
      }}
    />
  );
}