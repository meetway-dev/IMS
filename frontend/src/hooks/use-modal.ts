import { useCallback } from 'react';
import { useModalContext } from '@/context/modal.context';
import {
  ComponentModalOptions,
  ContentModalOptions,
  ConfirmModalOptions,
  PromptModalOptions,
  CustomModalOptions,
  QuickConfirmOptions,
  QuickPromptOptions,
  QuickAlertOptions,
  ModalType,
} from '@/context/modal.types';

/**
 * Enhanced modal hook with clean API and type safety
 */
export function useModal() {
  const modalContext = useModalContext();

  // ==================== Core Modal Methods ====================
  const openModal = useCallback((
    options: Parameters<typeof modalContext.openModal>[0]
  ) => {
    return modalContext.openModal(options);
  }, [modalContext]);

  const openComponentModal = useCallback(<T = any>(
    options: Omit<ComponentModalOptions<T>, 'type'>
  ) => {
    return modalContext.openComponentModal(options);
  }, [modalContext]);

  const openContentModal = useCallback((
    options: Omit<ContentModalOptions, 'type'>
  ) => {
    return modalContext.openContentModal(options);
  }, [modalContext]);

  const openConfirmModal = useCallback((
    options: Omit<ConfirmModalOptions, 'type'>
  ) => {
    return modalContext.openConfirmModal(options);
  }, [modalContext]);

  const openPromptModal = useCallback((
    options: Omit<PromptModalOptions, 'type'>
  ) => {
    return modalContext.openPromptModal(options);
  }, [modalContext]);

  const openCustomModal = useCallback((
    options: Omit<CustomModalOptions, 'type'>
  ) => {
    return modalContext.openCustomModal(options);
  }, [modalContext]);

  // ==================== Quick Action Methods ====================
  const confirm = useCallback((
    message: string,
    options?: QuickConfirmOptions
  ) => {
    const {
      title = 'Confirm',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      onCancel,
      variant = 'default',
    } = options || {};

    return modalContext.openConfirmModal({
      title,
      message,
      confirmText,
      cancelText,
      confirmVariant: variant === 'destructive' ? 'destructive' : 'default',
      onConfirm,
      onCancel,
      size: 'sm',
    });
  }, [modalContext]);

  const prompt = useCallback((
    message: string,
    options?: QuickPromptOptions
  ) => {
    const {
      title = 'Prompt',
      defaultValue = '',
      placeholder = 'Enter value',
      submitText = 'Submit',
      cancelText = 'Cancel',
      onSubmit,
      onCancel,
    } = options || {};

    return modalContext.openPromptModal({
      title,
      message,
      defaultValue,
      placeholder,
      submitText,
      cancelText,
      onSubmit,
      onCancel,
      size: 'sm',
    });
  }, [modalContext]);

  const alert = useCallback((
    message: string,
    options?: QuickAlertOptions
  ) => {
    const {
      title = 'Alert',
      buttonText = 'OK',
      onClose,
    } = options || {};

    return modalContext.openConfirmModal({
      title,
      message,
      confirmText: buttonText,
      showCancel: false,
      onConfirm: onClose,
      size: 'sm',
    });
  }, [modalContext]);

  // ==================== Form & Detail Modal Helpers ====================
  const openFormModal = useCallback(<T = any>(
    component: React.ComponentType<T>,
    componentProps?: T,
    options?: {
      title?: string;
      size?: 'sm' | 'md' | 'lg' | 'xl';
      onClose?: () => void;
    }
  ) => {
    const {
      title = 'Form',
      size = 'lg',
      onClose,
    } = options || {};

    return modalContext.openComponentModal({
      component,
      componentProps,
      title,
      size,
      onClose,
      scrollable: false,
    });
  }, [modalContext]);

  const openDetailModal = useCallback(<T = any>(
    component: React.ComponentType<T>,
    componentProps?: T,
    options?: {
      title?: string;
      size?: 'sm' | 'md' | 'lg' | 'xl';
      onClose?: () => void;
    }
  ) => {
    const {
      title = 'Details',
      size = 'xl',
      onClose,
    } = options || {};

    return modalContext.openComponentModal({
      component,
      componentProps,
      title,
      size,
      onClose,
      scrollable: true,
    });
  }, [modalContext]);

  // ==================== Modal Management Methods ====================
  const closeModal = useCallback((
    id: string
  ) => {
    modalContext.closeModal(id);
  }, [modalContext]);

  const closeAllModals = useCallback(() => {
    modalContext.closeAllModals();
  }, [modalContext]);

  const updateModal = useCallback((
    id: string,
    options: Parameters<typeof modalContext.updateModal>[1]
  ) => {
    modalContext.updateModal(id, options);
  }, [modalContext]);

  const isModalOpen = useCallback((
    id: string
  ) => {
    return modalContext.isModalOpen(id);
  }, [modalContext]);

  const getOpenModals = useCallback(() => {
    return modalContext.getOpenModals();
  }, [modalContext]);

  const getModal = useCallback((
    id: string
  ) => {
    return modalContext.getModal(id);
  }, [modalContext]);

  // ==================== Return API ====================
  return {
    // Core modal opening methods
    openModal,
    openComponentModal,
    openContentModal,
    openConfirmModal,
    openPromptModal,
    openCustomModal,
    
    // Quick action methods
    confirm,
    prompt,
    alert,
    
    // Helper methods
    openFormModal,
    openDetailModal,
    
    // Modal management
    closeModal,
    closeAllModals,
    updateModal,
    isModalOpen,
    getOpenModals,
    getModal,
    
    // Direct context access (for advanced use cases)
    context: modalContext,
  };
}

// ==================== Type Export ====================
export type UseModalReturn = ReturnType<typeof useModal>;