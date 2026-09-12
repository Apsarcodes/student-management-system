import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-4">
        <div
          className={`p-3 rounded-full flex-shrink-0 ${
            isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-xl focus:outline-hidden focus:ring-2 transition-colors disabled:opacity-50 flex items-center space-x-2 ${
            isDestructive
              ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
              : 'bg-brand-600 hover:bg-brand-700 focus:ring-brand-500'
          }`}
        >
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          )}
          <span>{confirmText}</span>
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
