'use client';

import React from 'react';
import { useModal } from '@/hooks/use-modal';
import { BaseModalOptions } from '@/context/modal.types';

// Modal registry type
export interface ModalRegistry {
  [key: string]: React.ComponentType<any>;
}

// Modal factory context
interface ModalFactoryContextValue {
  registerModal: (type: string, component: React.ComponentType<any>) => void;
  unregisterModal: (type: string) => void;
  openRegisteredModal: <T = any>(
    type: string,
    props?: T,
    options?: BaseModalOptions
  ) => string;
  getModalComponent: (type: string) => React.ComponentType<any> | undefined;
}

const ModalFactoryContext = React.createContext<ModalFactoryContextValue | undefined>(undefined);

// Provider component
interface ModalFactoryProviderProps {
  children: React.ReactNode;
  initialRegistry?: ModalRegistry;
}

export function ModalFactoryProvider({ children, initialRegistry = {} }: ModalFactoryProviderProps) {
  const [registry, setRegistry] = React.useState<ModalRegistry>(initialRegistry);
  const { openComponentModal } = useModal();

  const registerModal = React.useCallback((type: string, component: React.ComponentType<any>) => {
    setRegistry(prev => ({
      ...prev,
      [type]: component,
    }));
  }, []);

  const unregisterModal = React.useCallback((type: string) => {
    setRegistry(prev => {
      const { [type]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const openRegisteredModal = React.useCallback(<T = any>(
    type: string,
    props?: T,
    options?: BaseModalOptions
  ): string => {
    const component = registry[type];
    if (!component) {
      throw new Error(`Modal type "${type}" is not registered`);
    }

    return openComponentModal({
      component,
      componentProps: props,
      ...options,
    });
  }, [registry, openComponentModal]);

  const getModalComponent = React.useCallback((type: string) => {
    return registry[type];
  }, [registry]);

  const value = React.useMemo(() => ({
    registerModal,
    unregisterModal,
    openRegisteredModal,
    getModalComponent,
  }), [registerModal, unregisterModal, openRegisteredModal, getModalComponent]);

  return (
    <ModalFactoryContext.Provider value={value}>
      {children}
    </ModalFactoryContext.Provider>
  );
}

// Hook to use modal factory
export function useModalFactory() {
  const context = React.useContext(ModalFactoryContext);
  if (context === undefined) {
    throw new Error('useModalFactory must be used within a ModalFactoryProvider');
  }
  return context;
}

// Pre-built modal types for common use cases
export const MODAL_TYPES = {
  CONFIRM: 'confirm',
  PROMPT: 'prompt',
  ALERT: 'alert',
  FORM: 'form',
  DETAILS: 'details',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
} as const;

// Helper hook for quick modal access
export function useRegisteredModal() {
  const { openRegisteredModal } = useModalFactory();
  const { confirm, prompt, alert } = useModal();

  const openConfirm = React.useCallback((
    message: string,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void | Promise<void>;
      onCancel?: () => void;
      variant?: 'default' | 'destructive';
    }
  ) => {
    return confirm(message, options);
  }, [confirm]);

  const openPrompt = React.useCallback((
    message: string,
    options?: {
      title?: string;
      defaultValue?: string;
      placeholder?: string;
      submitText?: string;
      cancelText?: string;
      onSubmit?: (value: string) => void | Promise<void>;
      onCancel?: () => void;
    }
  ) => {
    return prompt(message, options);
  }, [prompt]);

  const openAlert = React.useCallback((
    message: string,
    options?: {
      title?: string;
      buttonText?: string;
      onClose?: () => void;
    }
  ) => {
    return alert(message, options);
  }, [alert]);

  const openForm = React.useCallback(<T = any>(
    type: string,
    props?: T,
    options?: BaseModalOptions & {
      title?: string;
      size?: 'sm' | 'md' | 'lg' | 'xl';
    }
  ) => {
    return openRegisteredModal(type, props, {
      title: options?.title || 'Form',
      size: options?.size || 'lg',
      scrollable: false,
      ...options,
    });
  }, [openRegisteredModal]);

  const openDetails = React.useCallback(<T = any>(
    type: string,
    props?: T,
    options?: BaseModalOptions & {
      title?: string;
      size?: 'sm' | 'md' | 'lg' | 'xl';
    }
  ) => {
    return openRegisteredModal(type, props, {
      title: options?.title || 'Details',
      size: options?.size || 'xl',
      scrollable: true,
      maxHeight: 'lg',
      ...options,
    });
  }, [openRegisteredModal]);

  return {
    openRegisteredModal,
    openConfirm,
    openPrompt,
    openAlert,
    openForm,
    openDetails,
  };
}