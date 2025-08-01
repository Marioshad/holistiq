import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from '../components/ui/SuccessToast';

interface ToastContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastDuration, setToastDuration] = useState(3000);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const showSuccess = useCallback((message: string, duration: number = 3000) => {
    setToastMessage(message);
    setToastDuration(duration);
    setToastType('success');
    setToastVisible(true);
  }, []);

  const showError = useCallback((message: string, duration: number = 3000) => {
    setToastMessage(message);
    setToastDuration(duration);
    setToastType('error');
    setToastVisible(true);
  }, []);

  const showInfo = useCallback((message: string, duration: number = 3000) => {
    setToastMessage(message);
    setToastDuration(duration);
    setToastType('info');
    setToastVisible(true);
  }, []);

  const showWarning = useCallback((message: string, duration: number = 3000) => {
    setToastMessage(message);
    setToastDuration(duration);
    setToastType('warning');
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning, hideToast }}>
      {children}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={hideToast}
        duration={toastDuration}
        position="bottom"
        type={toastType}
      />
    </ToastContext.Provider>
  );
}; 