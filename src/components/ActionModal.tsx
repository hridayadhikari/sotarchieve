import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ModalType = 'danger' | 'success' | 'info' | 'warning';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ModalType;
  isConfirmLoading?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'info',
  isConfirmLoading = false,
}) => {
  if (!isOpen) return null;

  const isAlertOnly = !onConfirm;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={22} style={{ color: '#ef4444' }} />;
      case 'success':
        return <CheckCircle2 size={22} style={{ color: '#22c55e' }} />;
      case 'warning':
        return <AlertTriangle size={22} style={{ color: '#f59e0b' }} />;
      case 'info':
      default:
        return <Info size={22} style={{ color: 'var(--accent)' }} />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn btn-primary';
      case 'success':
        return 'btn btn-primary';
      default:
        return 'btn btn-primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !isConfirmLoading && onClose()}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '440px', padding: '22px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '36px', 
              height: '36px', 
              borderRadius: 'var(--radius-md)', 
              background: type === 'danger' ? 'rgba(239, 68, 68, 0.12)' : type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'var(--sot-red-subtle)' 
            }}>
              {getIcon()}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h3>
          </div>
          <button className="btn-ghost btn-sm" disabled={isConfirmLoading} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
          {message}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {!isAlertOnly && (
            <button 
              type="button" 
              className="btn btn-ghost" 
              disabled={isConfirmLoading} 
              onClick={onClose}
            >
              {cancelLabel}
            </button>
          )}
          {onConfirm ? (
            <button
              type="button"
              className={getButtonClass()}
              style={type === 'danger' ? { background: '#ef4444', borderColor: '#ef4444', color: '#fff' } : type === 'success' ? { background: '#22c55e', borderColor: '#22c55e', color: '#fff' } : {}}
              disabled={isConfirmLoading}
              onClick={onConfirm}
            >
              {isConfirmLoading ? 'Processing...' : confirmLabel}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
