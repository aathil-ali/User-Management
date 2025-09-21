import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * UI Utility Hooks
 * 
 * Common hooks for UI state management and utilities
 */

// Toggle hook for boolean states
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { value, toggle, setTrue, setFalse, setValue };
};

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Previous value hook
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

// Mount/unmount detection
export const useIsMounted = () => {
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return useCallback(() => isMountedRef.current, []);
};

// Loading state management
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  
  const startLoading = useCallback((message?: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);
  
  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  }, []);
  
  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    setLoading: setIsLoading,
  };
};

// Async operation hook
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  
  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);
    
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

// Intersection observer hook (for infinite scrolling, etc.)
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<Element | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { ref: elementRef, isIntersecting, entry };
};

// Window size hook
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Media query hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Responsive breakpoints
export const useBreakpoint = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return {
    isMobile,
    isTablet, 
    isDesktop,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  };
};

// Clipboard hook
export const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      setCopied(false);
      return false;
    }
  }, []);
  
  return { copied, copy };
};

// Click outside hook
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: () => void
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handler]);

  return ref;
};

// Escape key hook
export const useEscapeKey = (handler: () => void) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handler]);
};

// Focus trap hook (for modals, etc.)
export const useFocusTrap = <T extends HTMLElement = HTMLElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return ref;
};

// Pagination hook
export const usePagination = (
  totalItems: number,
  itemsPerPage: number = 10,
  initialPage: number = 1
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  const goToPrevious = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);
  
  const goToNext = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);
  
  const goToFirst = useCallback(() => {
    goToPage(1);
  }, [goToPage]);
  
  const goToLast = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    goToPrevious,
    goToNext,
    goToFirst,
    goToLast,
  };
};

// Array state management hook
export const useArray = <T>(initialArray: T[] = []) => {
  const [array, setArray] = useState<T[]>(initialArray);
  
  const push = useCallback((item: T) => {
    setArray(arr => [...arr, item]);
  }, []);
  
  const remove = useCallback((index: number) => {
    setArray(arr => arr.filter((_, i) => i !== index));
  }, []);
  
  const removeById = useCallback((id: any, key: keyof T = 'id' as keyof T) => {
    setArray(arr => arr.filter(item => item[key] !== id));
  }, []);
  
  const update = useCallback((index: number, newItem: T) => {
    setArray(arr => arr.map((item, i) => i === index ? newItem : item));
  }, []);
  
  const clear = useCallback(() => {
    setArray([]);
  }, []);
  
  const replace = useCallback((newArray: T[]) => {
    setArray(newArray);
  }, []);
  
  return {
    array,
    set: setArray,
    push,
    remove,
    removeById,
    update,
    clear,
    replace,
    isEmpty: array.length === 0,
    length: array.length,
  };
};

// Form validation state hook
export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  }, []);
  
  const touchField = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const clearAll = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);
  
  const hasErrors = Object.keys(errors).length > 0;
  const isFieldTouched = (field: string) => touched[field] || false;
  const getFieldError = (field: string) => errors[field];
  
  return {
    errors,
    touched,
    hasErrors,
    setFieldError,
    clearFieldError,
    touchField,
    clearAll,
    isFieldTouched,
    getFieldError,
  };
};
