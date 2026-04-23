import { ReactNode, ComponentType } from 'react';
import { ResponsiveModalProps } from '@/components/ui/responsive-modal';

// ==================== Core Types ====================
export type ModalSize = ResponsiveModalProps['size'];
export type ModalMaxHeight = ResponsiveModalProps['maxHeight'];

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

// ==================== Modal Type Discriminators ====================
export enum ModalType {
  COMPONENT = 'component',
  CONTENT = 'content',
  CONFIRM = 'confirm',
  PROMPT = 'prompt',
  CUSTOM = 'custom',
}

// ==================== Base Interfaces ====================
export interface BaseModalOptions {
  /** Modal title */
  title?: ReactNode;
  /** Modal description */
  description?: ReactNode;
  /** Modal size */
  size?: ModalSize;
  /** Maximum height */
  maxHeight?: ModalMaxHeight;
  /** Whether modal is scrollable */
  scrollable?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Custom CSS class for modal */
  className?: string;
  /** Custom CSS class for modal content */
  contentClassName?: string;
  /** Custom CSS class for modal header */
  headerClassName?: string;
  /** Custom CSS class for modal body */
  bodyClassName?: string;
  /** Custom CSS class for modal footer */
  footerClassName?: string;
  /** Callback when modal closes */
  onClose?: () => void;
}

// ==================== Specific Modal Types ====================
export interface ComponentModalOptions<T = any> extends BaseModalOptions {
  type: ModalType.COMPONENT;
  /** Component to render */
  component: ComponentType<T>;
  /** Props to pass to the component */
  componentProps?: T;
}

export interface ContentModalOptions extends BaseModalOptions {
  type: ModalType.CONTENT;
  /** Content to render */
  content: ReactNode;
}

export interface ConfirmModalOptions extends BaseModalOptions {
  type: ModalType.CONFIRM;
  /** Confirmation message */
  message: ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: ButtonVariant;
  /** Whether to show cancel button */
  showCancel?: boolean;
  /** Callback when confirmed */
  onConfirm?: () => void | Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
}

export interface PromptModalOptions extends BaseModalOptions {
  type: ModalType.PROMPT;
  /** Prompt message */
  message: ReactNode;
  /** Default value */
  defaultValue?: string;
  /** Placeholder for input */
  placeholder?: string;
  /** Label for input */
  label?: string;
  /** Validation function */
  validate?: (value: string) => string | null;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Callback when submitted */
  onSubmit?: (value: string) => void | Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
}

export interface CustomModalOptions extends BaseModalOptions {
  type: ModalType.CUSTOM;
  /** Custom render function for modal content */
  renderContent: (props: { onClose: () => void }) => ReactNode;
  /** Custom render function for modal footer */
  renderFooter?: (props: { onClose: () => void }) => ReactNode;
}

// ==================== Union Type ====================
export type ModalOptions =
  | ComponentModalOptions
  | ContentModalOptions
  | ConfirmModalOptions
  | PromptModalOptions
  | CustomModalOptions;

// ==================== Type Guards ====================
export const isComponentModal = (options: ModalOptions): options is ComponentModalOptions =>
  options.type === ModalType.COMPONENT;

export const isContentModal = (options: ModalOptions): options is ContentModalOptions =>
  options.type === ModalType.CONTENT;

export const isConfirmModal = (options: ModalOptions): options is ConfirmModalOptions =>
  options.type === ModalType.CONFIRM;

export const isPromptModal = (options: ModalOptions): options is PromptModalOptions =>
  options.type === ModalType.PROMPT;

export const isCustomModal = (options: ModalOptions): options is CustomModalOptions =>
  options.type === ModalType.CUSTOM;

// ==================== State & Context Types ====================
export interface ModalState {
  id: string;
  options: ModalOptions;
  isOpen: boolean;
}

export interface ModalContextValue {
  /** Open any type of modal */
  openModal: (options: ModalOptions) => string;
  
  /** Type-safe convenience methods */
  openComponentModal: <T = any>(options: Omit<ComponentModalOptions<T>, 'type'>) => string;
  openContentModal: (options: Omit<ContentModalOptions, 'type'>) => string;
  openConfirmModal: (options: Omit<ConfirmModalOptions, 'type'>) => string;
  openPromptModal: (options: Omit<PromptModalOptions, 'type'>) => string;
  openCustomModal: (options: Omit<CustomModalOptions, 'type'>) => string;
  
  /** Modal management */
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, options: Partial<ModalOptions>) => void;
  
  /** Query methods */
  isModalOpen: (id: string) => boolean;
  getOpenModals: () => ModalState[];
  getModal: (id: string) => ModalState | undefined;
}

// ==================== Quick Modal Options ====================
export interface QuickConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface QuickPromptOptions {
  title?: string;
  defaultValue?: string;
  placeholder?: string;
  submitText?: string;
  cancelText?: string;
  onSubmit?: (value: string) => void | Promise<void>;
  onCancel?: () => void;
}

export interface QuickAlertOptions {
  title?: string;
  buttonText?: string;
  onClose?: () => void;
}