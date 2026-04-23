'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveModal } from './responsive-modal';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { 
  ModalState, 
  ModalType, 
  isComponentModal, 
  isContentModal, 
  isConfirmModal, 
  isPromptModal, 
  isCustomModal,
  ConfirmModalOptions,
  PromptModalOptions
} from '@/context/modal.types';

interface ModalRendererProps {
  modals: ModalState[];
  onCloseModal: (id: string) => void;
}

// ==================== Confirm Modal Component ====================
interface ConfirmModalProps {
  modal: ModalState;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ modal, onClose }) => {
  if (!isConfirmModal(modal.options)) return null;
  
  const options = modal.options as ConfirmModalOptions;
  const {
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'default',
    showCancel = true,
    onConfirm,
    onCancel,
    ...modalProps
  } = options;

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      try {
        await onConfirm();
      } finally {
        setIsLoading(false);
      }
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <ResponsiveModal
      key={modal.id}
      open={modal.isOpen}
      onClose={onClose}
      {...modalProps}
      footer={
        <div className="flex justify-end gap-2">
          {showCancel && (
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              {cancelText}
            </Button>
          )}
          <Button 
            variant={confirmVariant} 
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="py-4">{message}</div>
    </ResponsiveModal>
  );
};

// ==================== Prompt Modal Component ====================
interface PromptModalProps {
  modal: ModalState;
  onClose: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({ modal, onClose }) => {
  if (!isPromptModal(modal.options)) return null;
  
  const options = modal.options as PromptModalOptions;
  const {
    message,
    defaultValue = '',
    placeholder = 'Enter value',
    label,
    submitText = 'Submit',
    cancelText = 'Cancel',
    validate,
    onSubmit,
    onCancel,
    ...modalProps
  } = options;

  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
    setError(null);
  }, [defaultValue, modal.isOpen]);

  const handleSubmit = async () => {
    if (validate) {
      const validationError = validate(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (onSubmit) {
      setIsLoading(true);
      try {
        await onSubmit(value);
      } finally {
        setIsLoading(false);
      }
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <ResponsiveModal
      key={modal.id}
      open={modal.isOpen}
      onClose={onClose}
      {...modalProps}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button onClick={handleSubmit} loading={isLoading} disabled={isLoading}>
            {submitText}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-4">
        <div>{message}</div>
        <div className="space-y-2">
          {label && <Label htmlFor={`prompt-${modal.id}`}>{label}</Label>}
          <Input
            id={`prompt-${modal.id}`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            className={error ? 'border-destructive' : ''}
            autoFocus
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSubmit();
              }
            }}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};

// ==================== Component Modal Renderer ====================
interface ComponentModalRendererProps {
  modal: ModalState;
  onClose: () => void;
}

const ComponentModalRenderer: React.FC<ComponentModalRendererProps> = ({ modal, onClose }) => {
  if (!isComponentModal(modal.options)) return null;
  
  const { component: Component, componentProps, ...modalProps } = modal.options;
  
  return (
    <ResponsiveModal
      key={modal.id}
      open={modal.isOpen}
      onClose={onClose}
      {...modalProps}
    >
      <Component {...(componentProps || {})} />
    </ResponsiveModal>
  );
};

// ==================== Content Modal Renderer ====================
interface ContentModalRendererProps {
  modal: ModalState;
  onClose: () => void;
}

const ContentModalRenderer: React.FC<ContentModalRendererProps> = ({ modal, onClose }) => {
  if (!isContentModal(modal.options)) return null;
  
  const { content, ...modalProps } = modal.options;
  
  return (
    <ResponsiveModal
      key={modal.id}
      open={modal.isOpen}
      onClose={onClose}
      {...modalProps}
    >
      {content}
    </ResponsiveModal>
  );
};

// ==================== Custom Modal Renderer ====================
interface CustomModalRendererProps {
  modal: ModalState;
  onClose: () => void;
}

const CustomModalRenderer: React.FC<CustomModalRendererProps> = ({ modal, onClose }) => {
  if (!isCustomModal(modal.options)) return null;
  
  const { renderContent, renderFooter, ...modalProps } = modal.options;
  
  return (
    <ResponsiveModal
      key={modal.id}
      open={modal.isOpen}
      onClose={onClose}
      {...modalProps}
      footer={renderFooter ? renderFooter({ onClose }) : undefined}
    >
      {renderContent({ onClose })}
    </ResponsiveModal>
  );
};

// ==================== Main Modal Renderer ====================
export function ModalRenderer({ modals, onCloseModal }: ModalRendererProps) {
  const renderModal = (modal: ModalState) => {
    const handleClose = () => {
      onCloseModal(modal.id);
      if (modal.options.onClose) {
        modal.options.onClose();
      }
    };

    switch (modal.options.type) {
      case ModalType.COMPONENT:
        return <ComponentModalRenderer key={modal.id} modal={modal} onClose={handleClose} />;
      
      case ModalType.CONTENT:
        return <ContentModalRenderer key={modal.id} modal={modal} onClose={handleClose} />;
      
      case ModalType.CONFIRM:
        return <ConfirmModal key={modal.id} modal={modal} onClose={handleClose} />;
      
      case ModalType.PROMPT:
        return <PromptModal key={modal.id} modal={modal} onClose={handleClose} />;
      
      case ModalType.CUSTOM:
        return <CustomModalRenderer key={modal.id} modal={modal} onClose={handleClose} />;
      
      default:
        // Type-safe fallback
        const exhaustiveCheck: never = modal.options;
        return null;
    }
  };

  return <>{modals.map(renderModal)}</>;
}