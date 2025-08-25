import { useEffect, useRef, useState, useCallback } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

interface UseLazyLoadingReturn {
  ref: React.RefObject<HTMLElement | null>;
  isVisible: boolean;
  isLoaded: boolean;
  load: () => void;
}

export const useLazyLoading = ({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  delay = 0
}: UseLazyLoadingOptions = {}): UseLazyLoadingReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const load = useCallback(() => {
    if (delay > 0) {
      setTimeout(() => setIsLoaded(true), delay);
    } else {
      setIsLoaded(true);
    }
  }, [delay]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          load();
          
          if (triggerOnce && observerRef.current) {
            observerRef.current.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, load]);

  return { ref, isVisible, isLoaded, load };
};

// Hook para lazy loading de imagens
export const useLazyImage = (src: string, options?: UseLazyLoadingOptions) => {
  const { ref, isVisible } = useLazyLoading(options);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isVisible && !imageLoaded && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setImageLoaded(true);
        setError(false);
      };
      img.onerror = () => {
        setError(true);
      };
      img.src = src;
    }
  }, [isVisible, src, imageLoaded]);

  return {
    ref,
    src: imageSrc,
    isLoaded: imageLoaded,
    error,
    isVisible
  };
};

// Hook para lazy loading de componentes
export const useLazyComponent = <T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options?: UseLazyLoadingOptions
) => {
  const { ref, isVisible } = useLazyLoading(options);
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isVisible && !Component && !loading) {
      setLoading(true);
      importFn()
        .then((module) => {
          setComponent(() => module.default);
          setError(null);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isVisible, Component, loading, importFn]);

  return {
    ref,
    Component,
    loading,
    error,
    isVisible
  };
};