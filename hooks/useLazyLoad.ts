'use client';

import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useLazyLoad<T extends HTMLElement>(
  options: UseLazyLoadOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (triggerOnce && hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return {
    elementRef,
    isIntersecting: triggerOnce ? (hasTriggered || isIntersecting) : isIntersecting,
    hasTriggered,
  };
}

// Hook específico para imagens com preload
export function useLazyImage(src: string, options?: UseLazyLoadOptions) {
  const { elementRef, isIntersecting } = useLazyLoad<HTMLImageElement>(options);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isIntersecting || !src) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setIsError(false);
    };
    img.onerror = () => {
      setIsError(true);
      setIsLoaded(false);
    };
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isIntersecting, src]);

  return {
    elementRef,
    imageSrc,
    isLoaded,
    isError,
    isIntersecting,
  };
}

// Hook para componentes de receitas
export function useLazyRecipe(recipeId: string, options?: UseLazyLoadOptions) {
  const { elementRef, isIntersecting } = useLazyLoad<HTMLDivElement>(options);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true);
      
      // Analytics tracking para receitas visualizadas
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'recipe_view', {
          recipe_id: recipeId,
          event_category: 'engagement',
        });
      }
    }
  }, [isIntersecting, shouldLoad, recipeId]);

  return {
    elementRef,
    shouldLoad,
    isIntersecting,
  };
}

// Declaração global para gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}