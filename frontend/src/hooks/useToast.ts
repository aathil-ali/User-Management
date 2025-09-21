import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    toast: context.addToast,
    toasts: context.toasts,
    removeToast: context.removeToast,
    clearAll: context.clearAll,
    success: (message: string, title?: string) => {
      context.addToast({ type: 'success', message, title });
    },
    error: (message: string, title?: string) => {
      context.addToast({ type: 'error', message, title });
    },
    warning: (message: string, title?: string) => {
      context.addToast({ type: 'warning', message, title });
    },
    info: (message: string, title?: string) => {
      context.addToast({ type: 'info', message, title });
    },
  };
};

export default useToast;
