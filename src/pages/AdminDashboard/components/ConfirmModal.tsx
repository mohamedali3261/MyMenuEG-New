import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, HelpCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  rtl?: boolean;
}

export default function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant = 'danger', rtl 
}: ConfirmModalProps) {
  
  const getIcon = () => {
    switch (variant) {
      case 'warning': return <HelpCircle size={40} className="relative z-10" />;
      case 'info': return <Info size={40} className="relative z-10" />;
      default: return <AlertCircle size={40} className="relative z-10" />;
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'warning': return { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', btn: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30', pulse: 'bg-orange-500/20' };
      case 'info': return { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30', pulse: 'bg-blue-500/20' };
      default: return { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', btn: 'bg-red-600 hover:bg-red-700 shadow-red-500/30', pulse: 'bg-red-500/20' };
    }
  };

  const colors = getColors();

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto outline-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <div className="relative flex min-h-screen items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-md glass-card p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/20 bg-white/90 dark:bg-slate-900/95 overflow-hidden pointer-events-auto ${rtl ? 'text-right' : 'text-left'}`}
              dir={rtl ? 'rtl' : 'ltr'}
            >
              {/* Background Accents */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 ${colors.pulse} rounded-full blur-3xl`} />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />

              <div className="flex flex-col items-center">
                {/* Variant Icon Container */}
                <div className={`w-20 h-20 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} mb-6 relative`}>
                  <div className={`absolute inset-0 rounded-full ${colors.pulse} animate-ping`} />
                  {getIcon()}
                </div>

                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 text-center">
                  {title || (rtl ? 'تأكيد العملية' : 'Confirm Action')}
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-center mb-8 leading-relaxed text-lg">
                  {message || (rtl ? 'هل أنت متأكد من القيام بهذا الإجراء؟' : 'Are you sure you want to perform this action?')}
                </p>

                <div className="flex flex-col sm:flex-row-reverse gap-4 w-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirm();
                    }}
                    className={`flex-1 ${colors.btn} text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-lg`}
                  >
                    {confirmText || (rtl ? 'تأكيد' : 'Confirm')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-lg border border-slate-200 dark:border-white/10"
                  >
                    <X size={20} />
                    {cancelText || (rtl ? 'إلغاء' : 'Cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
