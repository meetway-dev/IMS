'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { ModalRenderer as ModalRendererComponent } from '@/components/ui/modal-renderer';
import {
  ModalContextValue,
  ModalState,
  ModalOptions,
  ComponentModalOptions,
  ContentModalOptions,
  ConfirmModalOptions,
  PromptModalOptions,
  CustomModalOptions,
  ModalType,
} from './modal.types';

// ==================== Reducer & Actions ====================
type ModalAction =
  | { type: 'OPEN_MODAL'; payload: { id: string; options: ModalOptions } }
  | { type: 'CLOSE_MODAL'; payload: { id: string } }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'UPDATE_MODAL'; payload: { id: string; options: Partial<ModalOptions> } }
  | { type: 'REMOVE_CLOSED_MODALS' };

function modalReducer(state: ModalState[], action: ModalAction): ModalState[] {
  switch (action.type) {
    case 'OPEN_MODAL':
      return [...state, { ...action.payload, isOpen: true }];
    
    case 'CLOSE_MODAL':
      return state.map(modal =>
        modal.id === action.payload.id ? { ...modal, isOpen: false } : modal
      );
    
    case 'CLOSE_ALL_MODALS':
      return state.map(modal => ({ ...modal, isOpen: false }));
    
    case 'UPDATE_MODAL':
      return state.map(modal => {
        if (modal.id !== action.payload.id) return modal;
        
        // Preserve the modal type when updating
        const currentType = modal.options.type;
        const updatedOptions = { ...modal.options, ...action.payload.options };
        
        // Ensure type is preserved (can't change modal type through update)
        return {
          ...modal,
          options: {
            ...updatedOptions,
            type: currentType,
          } as ModalOptions,
        };
      });
    
    case 'REMOVE_CLOSED_MODALS':
      return state.filter(modal => modal.isOpen);
    
    default:
      return state;
  }
}

// ==================== Provider Component ====================
interface ModalProviderProps {
  children: React.ReactNode;
  /** Maximum number of modals that can be open simultaneously */
  maxModals?: number;
  /** Whether to automatically remove closed modals from state */
  autoRemoveClosed?: boolean;
}

export function ModalProvider({ 
  children, 
  maxModals = 5,
  autoRemoveClosed = true,
}: ModalProviderProps) {
  const [modals, dispatch] = useReducer(modalReducer, []);

  // Generate unique modal ID
  const generateId = useCallback(() => {
    return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Clean up closed modals
  const cleanupClosedModals = useCallback(() => {
    if (autoRemoveClosed) {
      dispatch({ type: 'REMOVE_CLOSED_MODALS' });
    }
  }, [autoRemoveClosed]);

  // Core open modal function
  const openModal = useCallback((options: ModalOptions): string => {
    const id = generateId();
    
    // Enforce maximum modals limit
    if (modals.length >= maxModals) {
      // Close the oldest modal
      const oldestModal = modals.find(m => m.isOpen);
      if (oldestModal) {
        dispatch({ type: 'CLOSE_MODAL', payload: { id: oldestModal.id } });
      }
    }
    
    dispatch({ type: 'OPEN_MODAL', payload: { id, options } });
    return id;
  }, [generateId, modals, maxModals]);

  // Type-safe convenience methods
  const openComponentModal = useCallback(<T = any>(
    options: Omit<ComponentModalOptions<T>, 'type'>
  ): string => {
    return openModal({ ...options, type: ModalType.COMPONENT });
  }, [openModal]);

  const openContentModal = useCallback((
    options: Omit<ContentModalOptions, 'type'>
  ): string => {
    return openModal({ ...options, type: ModalType.CONTENT });
  }, [openModal]);

  const openConfirmModal = useCallback((
    options: Omit<ConfirmModalOptions, 'type'>
  ): string => {
    return openModal({ ...options, type: ModalType.CONFIRM });
  }, [openModal]);

  const openPromptModal = useCallback((
    options: Omit<PromptModalOptions, 'type'>
  ): string => {
    return openModal({ ...options, type: ModalType.PROMPT });
  }, [openModal]);

  const openCustomModal = useCallback((
    options: Omit<CustomModalOptions, 'type'>
  ): string => {
    return openModal({ ...options, type: ModalType.CUSTOM });
  }, [openModal]);

  // Close modal with cleanup
  const closeModal = useCallback((id: string) => {
    dispatch({ type: 'CLOSE_MODAL', payload: { id } });
    
    // Call onClose callback if provided
    const modal = modals.find(m => m.id === id);
    if (modal?.options.onClose) {
      modal.options.onClose();
    }
    
    // Schedule cleanup
    if (autoRemoveClosed) {
      setTimeout(cleanupClosedModals, 300); // Wait for animation
    }
  }, [modals, autoRemoveClosed, cleanupClosedModals]);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_MODALS' });
    
    // Call onClose for all modals
    modals.forEach(modal => {
      if (modal.options.onClose) {
        modal.options.onClose();
      }
    });
    
    // Schedule cleanup
    if (autoRemoveClosed) {
      setTimeout(cleanupClosedModals, 300);
    }
  }, [modals, autoRemoveClosed, cleanupClosedModals]);

  const updateModal = useCallback((id: string, options: Partial<ModalOptions>) => {
    dispatch({ type: 'UPDATE_MODAL', payload: { id, options } });
  }, []);

  const isModalOpen = useCallback((id: string) => {
    return modals.some(modal => modal.id === id && modal.isOpen);
  }, [modals]);

  const getOpenModals = useCallback(() => {
    return modals.filter(modal => modal.isOpen);
  }, [modals]);

  const getModal = useCallback((id: string) => {
    return modals.find(modal => modal.id === id);
  }, [modals]);

  // Context value
  const value = useMemo<ModalContextValue>(() => ({
    openModal,
    openComponentModal,
    openContentModal,
    openConfirmModal,
    openPromptModal,
    openCustomModal,
    closeModal,
    closeAllModals,
    updateModal,
    isModalOpen,
    getOpenModals,
    getModal,
  }), [
    openModal,
    openComponentModal,
    openContentModal,
    openConfirmModal,
    openPromptModal,
    openCustomModal,
    closeModal,
    closeAllModals,
    updateModal,
    isModalOpen,
    getOpenModals,
    getModal,
  ]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalRendererComponent modals={modals} onCloseModal={closeModal} />
    </ModalContext.Provider>
  );
}

// ==================== Context Creation ====================
const ModalContext = createContext<ModalContextValue | undefined>(undefined);

// Hook to use modal context
export function useModalContext() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}