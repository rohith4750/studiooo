'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
  confirm: (message: string, options?: { title?: string; confirmText?: string; cancelText?: string }) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    resolve: (val: boolean) => void;
  } | null>(null);

  const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const confirm = (
    message: string, 
    options?: { title?: string; confirmText?: string; cancelText?: string }
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title: options?.title || 'Action Confirmation',
        message,
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        resolve,
      });
    });
  };

  const handleConfirmClose = (result: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(result);
      setConfirmDialog(null);
    }
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white border border-neutral-200/60 rounded shadow-lg animate-slideInRight transition-all duration-300 font-sans`}
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            }}
          >
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />}

            <div className="flex-1 text-[11px] leading-snug font-bold text-neutral-800 font-sans">
              {t.message}
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] bg-neutral-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded max-w-md w-full shadow-2xl border border-neutral-100/50 flex flex-col p-6 space-y-4 animate-scaleIn font-sans"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div className="flex items-center space-x-3 text-neutral-850">
              <div className="p-2.5 bg-accent-50 text-accent-500 rounded">
                <AlertTriangle className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-sm font-extrabold tracking-tight text-neutral-850">{confirmDialog.title}</h3>
            </div>

            <p className="text-[11px] leading-relaxed text-neutral-500 font-semibold font-sans">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-100/50">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="px-4.5 py-2 border border-neutral-200 hover:bg-neutral-50 text-[11px] font-bold text-neutral-600 rounded cursor-pointer transition duration-150"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className="px-4.5 py-2 bg-primary-500 hover:bg-primary-600 text-[11px] font-bold text-white rounded cursor-pointer transition duration-150"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
